/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, sort-imports */
import { http, HttpResponse } from 'msw';
import type { Fleet, Repository } from '@flightctl/types';
import type { Device } from '@flightctl/types';
// Reuse existing Cypress fixtures
import { basicFleets } from '../../../../libs/cypress/fixtures/fleets/initialFleets';
import { repoList } from '../../../../libs/cypress/fixtures/repositories/initialRepositories';

function buildListResponse<T>(items: T[], kind: string) {
	return {
		apiVersion: 'v1alpha1',
		kind,
		metadata: {},
		items,
	};
}

const apiBase = '/api/flightctl/api/v1';
const loginBase = '/api/login';

function getMockDevices(): Device[] {
	return [
		{
			apiVersion: 'v1alpha1',
			kind: 'Device',
			metadata: {
				name: 'device-001',
				labels: { alias: 'edge-gw-01' } as Record<string, string>,
				owner: 'Fleet/eu-east-prod-001',
			} as unknown as Device['metadata'],
			spec: {
				os: { image: 'quay.io/example/os:1.0.0' },
				config: [
					{
						name: 'example-server',
						gitRef: {
							repository: 'defaultRepo',
							targetRevision: 'main',
							path: '/demos/basic-nginx-fleet/configuration/',
						},
					},
				] as any,
				applications: [
					{
						name: 'nginx',
						image: 'docker.io/library/nginx:1.25',
					},
					{
						name: 'prometheus',
						image: 'quay.io/prometheus/prometheus:v2.55.0',
					},
				] as any,
				systemd: {
					matchPatterns: ['nginx.service', 'prometheus.service'],
				},
			} as any,
			status: {
				summary: { status: 'Online' } as any,
				updated: { status: 'UpToDate' } as any,
				applicationsSummary: { status: 'Healthy' } as any,
				integrity: { status: 'Verified' } as any,
				applications: [
					{
						name: 'nginx',
						ready: '1/1',
						restarts: 0,
						status: 'Running',
					},
					{
						name: 'prometheus',
						ready: '1/1',
						restarts: 1,
						status: 'Running',
					},
				],
				resources: {} as any,
				config: {} as any,
				os: { image: 'quay.io/example/os:1.0.0' } as any,
				lifecycle: { status: 'Enrolled' } as any,
				systemInfo: {
					architecture: 'x86_64',
					operatingSystem: 'Linux',
					distroName: 'Fedora',
					distroVersion: '40',
					kernel: '6.10.5',
					hostname: 'edge-gw-01',
				} as any,
			} as any,
		},
		{
			apiVersion: 'v1alpha1',
			kind: 'Device',
			metadata: {
				name: 'device-002',
				labels: { alias: 'edge-gw-02' } as Record<string, string>,
				owner: 'Fleet/eu-west-prod-001',
			} as unknown as Device['metadata'],
			spec: {
				os: { image: 'quay.io/example/os:1.0.0' },
				config: [],
				applications: [
					{
						name: 'influxdb',
						image: 'docker.io/library/influxdb:2.7',
					},
				] as any,
				systemd: {
					matchPatterns: ['influxdb.service'],
				},
			} as any,
			status: {
				summary: { status: 'Online' } as any,
				updated: { status: 'UpdateAvailable' } as any,
				applicationsSummary: { status: 'Degraded' } as any,
				integrity: { status: 'Unknown' } as any,
				applications: [
					{
						name: 'influxdb',
						ready: '0/1',
						restarts: 3,
						status: 'Error',
					},
				],
				resources: {} as any,
				config: {} as any,
				os: { image: 'quay.io/example/os:1.0.0' } as any,
				lifecycle: { status: 'Enrolled' } as any,
				systemInfo: {
					architecture: 'x86_64',
					operatingSystem: 'Linux',
					distroName: 'Fedora',
					distroVersion: '40',
					kernel: '6.10.5',
					hostname: 'edge-gw-02',
				} as any,
			} as any,
		},
	];
}

export const handlers = [
	// --- Auth/login endpoints ---
	// Return a redirect URL for login flow (used by redirectToLogin)
	http.get(loginBase, () => {
		return HttpResponse.json({ url: '/callback?code=mock-code' });
	}),
	// Exchange code for session; return token expiry
	http.post(loginBase, () => {
		return HttpResponse.json({ expiresIn: 3600 });
	}),
	// Logged-in user info
	http.get(`${loginBase}/info`, () => {
		return HttpResponse.json({ username: 'mock-user' });
	}),
	// Token refresh
	http.get(`${loginBase}/refresh`, () => {
		return HttpResponse.json({ expiresIn: 3600 });
	}),
	// Logout via UI proxy
	http.get('/api/logout', () => {
		return HttpResponse.json({ url: '/' });
	}),

	// Devices list (+ optional query params)
	http.get(new RegExp(`${apiBase}/devices(\\?.*)?$`), ({ request }) => {
		const devices = getMockDevices();
		const url = new URL(request.url);
		const summaryOnly = url.searchParams.get('summaryOnly') === 'true';
		if (summaryOnly) {
			return HttpResponse.json({
				apiVersion: 'v1alpha1',
				kind: 'DeviceList',
				metadata: {},
				items: [],
				summary: {
					total: devices.length,
					applicationStatus: { Healthy: 1, Degraded: 1 },
					summaryStatus: { Online: 2 },
					updateStatus: { UpToDate: 1, UpdateAvailable: 1 },
				},
			});
		}
		return HttpResponse.json({
			apiVersion: 'v1alpha1',
			kind: 'DeviceList',
			metadata: {},
			items: devices,
		});
	}),

	// Device details
	http.get(new RegExp(`${apiBase}/devices/([\\w-]+)$`), ({ request }) => {
		const url = new URL(request.url);
		const nameMatch = url.pathname.match(/\/devices\/([\w-]+)$/);
		const name = nameMatch ? nameMatch[1] : '';
		const dev = getMockDevices().find((d) => d.metadata.name === name);
		if (dev) return HttpResponse.json(dev as Required<Device>);
		return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
	}),

	// Device last seen
	http.get(new RegExp(`${apiBase}/devices/([\\w-]+)/lastseen$`), () => {
		return HttpResponse.json({ lastSeen: new Date().toISOString() });
	}),

	// Patch device
	http.patch(new RegExp(`${apiBase}/devices/([\\w-]+)$`), () => {
		return HttpResponse.json({});
	}),

	// Decommission device
	http.put(new RegExp(`${apiBase}/devices/([\\w-]+)/decommission$`), () => {
		return HttpResponse.json({});
	}),

	// Delete device
	http.delete(new RegExp(`${apiBase}/devices/([\\w-]+)$`), () => {
		return HttpResponse.json({});
	}),

	// Fleets list
	http.get(new RegExp(`${apiBase}/fleets(\\?.*)?$`), () => {
		return HttpResponse.json(buildListResponse<Fleet>(basicFleets, 'FleetList'));
	}),

	// Fleet by name
	http.get(new RegExp(`${apiBase}/fleets/([\\w-]+)$`), ({ request }) => {
		// params from RegExp route aren't parsed automatically; extract from URL
		const url = new URL(request.url);
		const nameMatch = url.pathname.match(/\/fleets\/([\w-]+)$/);
		const name = nameMatch ? nameMatch[1] : '';
		const fleet = basicFleets.find((f) => f.metadata.name === name);
		if (fleet) return HttpResponse.json(fleet);
		return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
	}),

	// Create fleet
	http.post(`${apiBase}/fleets`, async ({ request }) => {
		const body = (await request.json()) as Fleet;
		const base = basicFleets[0];
		const created: Fleet = {
			...base,
			metadata: { ...base.metadata, name: body?.metadata?.name ?? base.metadata.name },
		};
		return HttpResponse.json(created, { status: 201 });
	}),

	// Repositories list
	http.get(`${apiBase}/repositories`, () => {
		return HttpResponse.json(buildListResponse<Repository>(repoList, 'RepositoryList'));
	}),

	// Repository by name
	http.get(new RegExp(`${apiBase}/repositories/([\\w-]+)$`), ({ request }) => {
		const url = new URL(request.url);
		const nameMatch = url.pathname.match(/\/repositories\/([\w-]+)$/);
		const name = nameMatch ? nameMatch[1] : '';
		const repo = repoList.find((r) => r.metadata.name === name);
		if (repo) return HttpResponse.json(repo);
		return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
	}),
];


