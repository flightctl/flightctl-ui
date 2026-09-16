import { type RolloutPolicy } from '@flightctl/types';
import { describe, expect, it } from 'vitest';

import { getInitialValues } from '../../components/Fleet/CreateFleet/utils';
import {
  BatchLimitType,
  type DeltaGenerationForm,
  type DisruptionBudgetForm,
  type FleetFormValues,
  type RolloutPolicyForm,
  UpdateMode,
} from '../../types/deviceSpec';
import { getRolloutPolicyPatches } from './patch';

const ROLLOUT_POLICY_PATH = '/spec/rolloutPolicy';
const DELTA_GENERATION_PATH = `${ROLLOUT_POLICY_PATH}/deltaGeneration`;

const defaultBatch = {
  limit: 25,
  limitType: BatchLimitType.BatchLimitPercent,
  successThreshold: 90,
  selector: [{ key: 'region', value: 'us-east' }],
};

const deviceSelectionApi = {
  strategy: 'BatchSequence' as const,
  sequence: [
    {
      limit: '25%',
      successThreshold: '90%',
      selector: {
        matchLabels: { region: 'us-east' },
      },
    },
  ],
};

const customizedRolloutPolicy: RolloutPolicyForm = {
  isCustomized: true,
  updateTimeout: 120,
  batches: [defaultBatch],
};

const customizedDisruptionBudget: DisruptionBudgetForm = {
  isCustomized: true,
  groupBy: ['rack'],
  minAvailable: 2,
};

const customizedDeltaGeneration: DeltaGenerationForm = {
  isCustomized: true,
  generateDelta: true,
  maxWaitForDelta: '45m',
  deltaGenerationTimeout: '10m',
};

const defaultDeltaGeneration: DeltaGenerationForm = {
  isCustomized: false,
  generateDelta: true,
  maxWaitForDelta: '',
  deltaGenerationTimeout: '',
};

const withFleetBlocks = (
  fleetValues: FleetFormValues,
  {
    updateMode = UpdateMode.Customized,
    rolloutPolicy,
    disruptionBudget,
    deltaGeneration,
  }: {
    updateMode?: UpdateMode;
    rolloutPolicy?: RolloutPolicyForm;
    disruptionBudget?: DisruptionBudgetForm;
    deltaGeneration?: DeltaGenerationForm;
  } = {},
): FleetFormValues => ({
  ...fleetValues,
  updateMode,
  rolloutPolicy: rolloutPolicy ?? fleetValues.rolloutPolicy,
  disruptionBudget: disruptionBudget ?? fleetValues.disruptionBudget,
  deltaGeneration: deltaGeneration ?? fleetValues.deltaGeneration,
});

const fullRolloutPolicyApi = (): RolloutPolicy => ({
  defaultUpdateTimeout: '2h',
  deviceSelection: deviceSelectionApi,
  disruptionBudget: { groupBy: ['rack'], minAvailable: 2 },
  deltaGeneration: {
    generateDelta: true,
    maxWaitForDelta: '45m',
    deltaGenerationTimeout: '10m',
  },
});

describe('getRolloutPolicyPatches', () => {
  describe('when rollout policy is unchanged', () => {
    it('returns no patches when form values match defaults', () => {
      expect(getRolloutPolicyPatches(undefined, getInitialValues())).toEqual([]);
    });
  });

  describe('when rollout policy is updated', () => {
    it('patches generateDelta when disabling delta generation on an existing policy', () => {
      const fleetValues = withFleetBlocks(getInitialValues(), {
        updateMode: UpdateMode.Default,
        deltaGeneration: { ...defaultDeltaGeneration, generateDelta: false },
      });
      const currentPolicy: RolloutPolicy = { deltaGeneration: { generateDelta: true } };

      expect(getRolloutPolicyPatches(currentPolicy, fleetValues)).toEqual([
        {
          op: 'replace',
          path: `${DELTA_GENERATION_PATH}/generateDelta`,
          value: false,
        },
      ]);
    });

    it('patches custom delta timing fields on an existing policy', () => {
      const fleetValues = withFleetBlocks(getInitialValues(), {
        updateMode: UpdateMode.Default,
        deltaGeneration: customizedDeltaGeneration,
      });
      const currentPolicy: RolloutPolicy = {};

      expect(getRolloutPolicyPatches(currentPolicy, fleetValues)).toEqual([
        {
          op: 'add',
          path: DELTA_GENERATION_PATH,
          value: {
            generateDelta: true,
            maxWaitForDelta: '45m',
            deltaGenerationTimeout: '10m',
          },
        },
      ]);
    });

    it('updates only disruptionBudget while deviceSelection and delta fields are unchanged', () => {
      const currentPolicy = fullRolloutPolicyApi();
      const fleetValues = withFleetBlocks(getInitialValues(), {
        rolloutPolicy: customizedRolloutPolicy,
        disruptionBudget: { ...customizedDisruptionBudget, minAvailable: 3 },
        deltaGeneration: customizedDeltaGeneration,
      });

      expect(getRolloutPolicyPatches(currentPolicy, fleetValues)).toEqual([
        {
          op: 'replace',
          path: `${ROLLOUT_POLICY_PATH}/disruptionBudget`,
          value: { groupBy: ['rack'], minAvailable: 3 },
        },
      ]);
    });

    it('adds disruptionBudget to an existing policy with deviceSelection and delta timing', () => {
      const currentPolicy: RolloutPolicy = {
        defaultUpdateTimeout: '2h',
        deviceSelection: deviceSelectionApi,
        deltaGeneration: {
          generateDelta: true,
          maxWaitForDelta: '45m',
          deltaGenerationTimeout: '10m',
        },
      };
      const fleetValues = withFleetBlocks(getInitialValues(), {
        rolloutPolicy: customizedRolloutPolicy,
        disruptionBudget: customizedDisruptionBudget,
        deltaGeneration: customizedDeltaGeneration,
      });

      expect(getRolloutPolicyPatches(currentPolicy, fleetValues)).toEqual([
        {
          op: 'add',
          path: `${ROLLOUT_POLICY_PATH}/disruptionBudget`,
          value: { groupBy: ['rack'], minAvailable: 2 },
        },
      ]);
    });

    it('adds deviceSelection to an existing policy with disruptionBudget and custom delta timing', () => {
      const currentPolicy: RolloutPolicy = {
        disruptionBudget: { groupBy: ['rack'], minAvailable: 2 },
        deltaGeneration: {
          generateDelta: true,
          maxWaitForDelta: '45m',
          deltaGenerationTimeout: '10m',
        },
      };
      const fleetValues = withFleetBlocks(getInitialValues(), {
        rolloutPolicy: customizedRolloutPolicy,
        disruptionBudget: customizedDisruptionBudget,
        deltaGeneration: customizedDeltaGeneration,
      });

      expect(getRolloutPolicyPatches(currentPolicy, fleetValues)).toEqual([
        {
          op: 'add',
          path: `${ROLLOUT_POLICY_PATH}/defaultUpdateTimeout`,
          value: '2h',
        },
        {
          op: 'add',
          path: `${ROLLOUT_POLICY_PATH}/deviceSelection`,
          value: deviceSelectionApi,
        },
      ]);
    });

    it('disables delta generation while keeping deviceSelection and disruptionBudget', () => {
      const currentPolicy = fullRolloutPolicyApi();
      const fleetValues = withFleetBlocks(getInitialValues(), {
        rolloutPolicy: customizedRolloutPolicy,
        disruptionBudget: customizedDisruptionBudget,
        deltaGeneration: { ...defaultDeltaGeneration, generateDelta: false },
      });

      expect(getRolloutPolicyPatches(currentPolicy, fleetValues)).toEqual([
        {
          op: 'replace',
          path: `${DELTA_GENERATION_PATH}/generateDelta`,
          value: false,
        },
        {
          op: 'remove',
          path: `${DELTA_GENERATION_PATH}/maxWaitForDelta`,
        },
        {
          op: 'remove',
          path: `${DELTA_GENERATION_PATH}/deltaGenerationTimeout`,
        },
      ]);
    });

    it('removes disruptionBudget while keeping deviceSelection and delta timing', () => {
      const currentPolicy = fullRolloutPolicyApi();
      const fleetValues = withFleetBlocks(getInitialValues(), {
        rolloutPolicy: customizedRolloutPolicy,
        disruptionBudget: { isCustomized: false, groupBy: [] },
        deltaGeneration: customizedDeltaGeneration,
      });

      expect(getRolloutPolicyPatches(currentPolicy, fleetValues)).toEqual([
        {
          op: 'remove',
          path: `${ROLLOUT_POLICY_PATH}/disruptionBudget`,
        },
      ]);
    });

    it('removes deviceSelection while keeping disruptionBudget and delta timing', () => {
      const currentPolicy = fullRolloutPolicyApi();
      const fleetValues = withFleetBlocks(getInitialValues(), {
        rolloutPolicy: { ...customizedRolloutPolicy, isCustomized: false },
        disruptionBudget: customizedDisruptionBudget,
        deltaGeneration: customizedDeltaGeneration,
      });

      expect(getRolloutPolicyPatches(currentPolicy, fleetValues)).toEqual([
        {
          op: 'remove',
          path: `${ROLLOUT_POLICY_PATH}/deviceSelection`,
        },
        {
          op: 'remove',
          path: `${ROLLOUT_POLICY_PATH}/defaultUpdateTimeout`,
        },
      ]);
    });

    it('removes deviceSelection only when defaultUpdateTimeout is absent', () => {
      const currentPolicy: RolloutPolicy = {
        deviceSelection: deviceSelectionApi,
        disruptionBudget: { groupBy: ['rack'], minAvailable: 2 },
        deltaGeneration: {
          generateDelta: true,
          maxWaitForDelta: '45m',
          deltaGenerationTimeout: '10m',
        },
      };
      const fleetValues = withFleetBlocks(getInitialValues(), {
        rolloutPolicy: { ...customizedRolloutPolicy, isCustomized: false },
        disruptionBudget: customizedDisruptionBudget,
        deltaGeneration: customizedDeltaGeneration,
      });

      expect(getRolloutPolicyPatches(currentPolicy, fleetValues)).toEqual([
        {
          op: 'remove',
          path: `${ROLLOUT_POLICY_PATH}/deviceSelection`,
        },
      ]);
    });

    it('removes defaultUpdateTimeout only when deviceSelection is absent', () => {
      const currentPolicy: RolloutPolicy = {
        defaultUpdateTimeout: '2h',
        disruptionBudget: { groupBy: ['rack'], minAvailable: 2 },
        deltaGeneration: {
          generateDelta: true,
          maxWaitForDelta: '45m',
          deltaGenerationTimeout: '10m',
        },
      };
      const fleetValues = withFleetBlocks(getInitialValues(), {
        rolloutPolicy: { ...customizedRolloutPolicy, isCustomized: false },
        disruptionBudget: customizedDisruptionBudget,
        deltaGeneration: customizedDeltaGeneration,
      });

      expect(getRolloutPolicyPatches(currentPolicy, fleetValues)).toEqual([
        {
          op: 'remove',
          path: `${ROLLOUT_POLICY_PATH}/defaultUpdateTimeout`,
        },
      ]);
    });

    it('removes custom delta timing while keeping deviceSelection and disruptionBudget', () => {
      const currentPolicy = fullRolloutPolicyApi();
      const fleetValues = withFleetBlocks(getInitialValues(), {
        rolloutPolicy: customizedRolloutPolicy,
        disruptionBudget: customizedDisruptionBudget,
        deltaGeneration: defaultDeltaGeneration,
      });

      expect(getRolloutPolicyPatches(currentPolicy, fleetValues)).toEqual([
        {
          op: 'remove',
          path: DELTA_GENERATION_PATH,
        },
      ]);
    });

    it('adds custom delta timing while keeping deviceSelection and disruptionBudget', () => {
      const currentPolicy: RolloutPolicy = {
        defaultUpdateTimeout: '2h',
        deviceSelection: deviceSelectionApi,
        disruptionBudget: { groupBy: ['rack'], minAvailable: 2 },
      };
      const fleetValues = withFleetBlocks(getInitialValues(), {
        rolloutPolicy: customizedRolloutPolicy,
        disruptionBudget: customizedDisruptionBudget,
        deltaGeneration: customizedDeltaGeneration,
      });

      expect(getRolloutPolicyPatches(currentPolicy, fleetValues)).toEqual([
        {
          op: 'add',
          path: DELTA_GENERATION_PATH,
          value: {
            generateDelta: true,
            maxWaitForDelta: '45m',
            deltaGenerationTimeout: '10m',
          },
        },
      ]);
    });
  });

  describe('when rollout policy is added', () => {
    it('adds rolloutPolicy when delta generation is disabled', () => {
      const fleetValues = withFleetBlocks(getInitialValues(), {
        updateMode: UpdateMode.Default,
        deltaGeneration: { ...defaultDeltaGeneration, generateDelta: false },
      });

      expect(getRolloutPolicyPatches(undefined, fleetValues)).toEqual([
        {
          op: 'add',
          path: ROLLOUT_POLICY_PATH,
          value: { deltaGeneration: { generateDelta: false } },
        },
      ]);
    });

    it('adds rolloutPolicy with custom delta timing only', () => {
      const fleetValues = withFleetBlocks(getInitialValues(), {
        updateMode: UpdateMode.Default,
        deltaGeneration: customizedDeltaGeneration,
      });

      expect(getRolloutPolicyPatches(undefined, fleetValues)).toEqual([
        {
          op: 'add',
          path: ROLLOUT_POLICY_PATH,
          value: {
            deltaGeneration: {
              generateDelta: true,
              maxWaitForDelta: '45m',
              deltaGenerationTimeout: '10m',
            },
          },
        },
      ]);
    });

    it('adds rolloutPolicy with deviceSelection only', () => {
      const fleetValues = withFleetBlocks(getInitialValues(), {
        rolloutPolicy: customizedRolloutPolicy,
      });

      expect(getRolloutPolicyPatches(undefined, fleetValues)).toEqual([
        {
          op: 'add',
          path: ROLLOUT_POLICY_PATH,
          value: {
            defaultUpdateTimeout: '2h',
            deviceSelection: deviceSelectionApi,
          },
        },
      ]);
    });

    it('adds rolloutPolicy with disruptionBudget only', () => {
      const fleetValues = withFleetBlocks(getInitialValues(), {
        disruptionBudget: customizedDisruptionBudget,
      });

      expect(getRolloutPolicyPatches(undefined, fleetValues)).toEqual([
        {
          op: 'add',
          path: ROLLOUT_POLICY_PATH,
          value: {
            disruptionBudget: { groupBy: ['rack'], minAvailable: 2 },
          },
        },
      ]);
    });

    it('adds rolloutPolicy with deviceSelection, disruptionBudget, and custom delta timing', () => {
      const fleetValues = withFleetBlocks(getInitialValues(), {
        rolloutPolicy: customizedRolloutPolicy,
        disruptionBudget: customizedDisruptionBudget,
        deltaGeneration: customizedDeltaGeneration,
      });

      expect(getRolloutPolicyPatches(undefined, fleetValues)).toEqual([
        {
          op: 'add',
          path: ROLLOUT_POLICY_PATH,
          value: {
            defaultUpdateTimeout: '2h',
            deviceSelection: deviceSelectionApi,
            disruptionBudget: { groupBy: ['rack'], minAvailable: 2 },
            deltaGeneration: {
              generateDelta: true,
              maxWaitForDelta: '45m',
              deltaGenerationTimeout: '10m',
            },
          },
        },
      ]);
    });

    it('adds rolloutPolicy with deviceSelection and delta opt-out', () => {
      const fleetValues = withFleetBlocks(getInitialValues(), {
        rolloutPolicy: customizedRolloutPolicy,
        deltaGeneration: { ...defaultDeltaGeneration, generateDelta: false },
      });

      expect(getRolloutPolicyPatches(undefined, fleetValues)).toEqual([
        {
          op: 'add',
          path: ROLLOUT_POLICY_PATH,
          value: {
            defaultUpdateTimeout: '2h',
            deviceSelection: deviceSelectionApi,
            deltaGeneration: { generateDelta: false },
          },
        },
      ]);
    });
  });

  describe('when rollout policy is deleted', () => {
    it('removes rolloutPolicy when reverting a delta opt-out to defaults', () => {
      const currentPolicy: RolloutPolicy = { deltaGeneration: { generateDelta: false } };

      expect(getRolloutPolicyPatches(currentPolicy, getInitialValues())).toEqual([
        {
          op: 'remove',
          path: ROLLOUT_POLICY_PATH,
        },
      ]);
    });

    it('removes rolloutPolicy when clearing custom delta timing back to defaults', () => {
      const currentPolicy: RolloutPolicy = {
        deltaGeneration: {
          generateDelta: true,
          maxWaitForDelta: '45m',
          deltaGenerationTimeout: '10m',
        },
      };

      expect(getRolloutPolicyPatches(currentPolicy, getInitialValues())).toEqual([
        {
          op: 'remove',
          path: ROLLOUT_POLICY_PATH,
        },
      ]);
    });
  });
});
