# UI Architecture — flightctl-ui

Architectural patterns and constraints that AI agents cannot reliably infer
from reading the source code. Supplements AGENTS.md. When uncertain about a
pattern, imitate the reference implementation cited — not this prose.

## Restricted Patterns (Enforced by ESLint)

These are caught by `no-restricted-imports` but agents write the wrong code
first. Avoid the round-trip.

| Never import                                                | Use instead                                                      |
| ----------------------------------------------------------- | ---------------------------------------------------------------- |
| `Form` from `@patternfly/react-core`                        | `FlightCtlForm` from `components/form/FlightCtlForm`             |
| `WizardFooterWrapper` / `WizardFooter` from `@patternfly/…` | `FlightCtlWizardFooter` from `components/common/…`               |
| `Drawer` / `DrawerPanelContent` from `@patternfly/…`        | `FlightCtlPageDrawer` from `components/common/…`                 |
| `useTranslation` from `react-i18next`                       | `useTranslation` from `@flightctl/ui-components/hooks/…`         |
| `@patternfly/react-icons` (barrel import)                   | `@patternfly/react-icons/dist/js/icons/<icon-name>`              |
| `@patternfly/react-tokens` (barrel import)                  | `@patternfly/react-tokens/dist/js/<token-name>`                  |
| `lodash` (barrel import)                                    | `lodash/<function>` (e.g. `lodash/debounce`)                     |
| `useNavigate` / `Link` from `react-router-dom`              | `useNavigate` / `Link` from `@flightctl/ui-components/hooks/…`   |

## Component Architecture

### Page Types

Two page layouts exist. Always use these — never compose raw PatternFly
`PageSection` + `Title` as a page.

**List page** — `ListPage` > `ListPageBody` > Toolbar + Table + Pagination:

```tsx
<ListPage title={t('Fleets')}>
  <ListPageBody error={error} loading={isLoading}>
    <Toolbar inset={{ default: 'insetNone' }}>
      <ToolbarContent>
        <ToolbarItem><TableTextSearch ... /></ToolbarItem>
        <ToolbarItem><Button>Create fleet</Button></ToolbarItem>
      </ToolbarContent>
    </Toolbar>
    <Table columns={columns} ...>
      <Tbody>
        {items.map(item => <FleetRow key={...} fleet={item} />)}
      </Tbody>
    </Table>
    <TablePagination pagination={pagination} />
  </ListPageBody>
</ListPage>
```
Reference: `components/Fleet/FleetsPage.tsx`

**Details page** — `DetailsPage` with `TabsNav` + nested `Routes`:

```tsx
<DetailsPage
  id={resourceId}
  title={<ResourceLink id={resourceId} />}
  error={error}
  loading={isLoading}
  resourceLink={ROUTE.FLEETS}
  resourceType="Fleets"
  resourceTypeLabel={t('Fleets')}
  actions={<DetailsPageActions>...</DetailsPageActions>}
  nav={<TabsNav ...>{/* Tab components */}</TabsNav>}
>
  <Routes>
    <Route path="details" element={<DetailsTab />} />
    <Route path="yaml" element={<YamlEditor />} />
  </Routes>
</DetailsPage>
```
Reference: `components/Fleet/FleetDetails/FleetDetailsPage.tsx`

### Form Fields

Never use bare PatternFly form controls inside a `FlightCtlForm`. Use the
Formik-integrated wrappers in `components/form/`:

| Instead of (PatternFly)  | Use (project wrapper)                |
| ------------------------ | ------------------------------------ |
| `TextInput`              | `TextField`                          |
| `Checkbox`               | `CheckboxField`                      |
| `Radio`                  | `RadioField`                         |
| `Switch`                 | `SwitchField`                        |
| `Select`                 | `FormSelect` / `FormSelectTypeahead` |
| `TextArea`               | `TextAreaField`                      |

These wrappers bind to Formik context — they handle validation, error display,
and field registration automatically.

### Actions Pattern

Actions (delete, decommission, resume) use hook pairs that return both trigger
JSX and modal JSX. Render them separately:

```tsx
const { deleteAction, deleteModal } = useDeleteAction({
  onDelete: () => remove(`fleets/${id}`),
  resourceType: 'Fleet',
  resourceName: name,
});

<DetailsPageActions>{deleteAction}</DetailsPageActions>
{deleteModal}
```

### File Conventions

- **Feature directories**: `components/Fleet/`, `components/Device/`, etc.
- **Sub-pages in subdirectories**: `Fleet/FleetDetails/`, `Fleet/CreateFleet/`
- **No barrel exports** — import components by full path, never via `index.ts`
- **Hooks co-located**: `use<Feature>.ts` lives next to the component using it
- **CSS class prefix**: `fctl-<component>__<element>` (BEM-style)

## Data Flow

### API Access

Access the API through context. Never import from `apiCalls.ts` directly:

```tsx
// Correct
const { get, post, put, remove, patch } = useFetch();

// Wrong — bypasses context, breaks in OCP plugin
import { fetchData } from 'utils/apiCalls';
```

### Fetching Data

`useFetchPeriodically` is the standard read pattern. It polls every 10 seconds,
manages abort signals, and distinguishes initial loading from background updates.

**Always wrap it in a domain-specific hook** — components never call
`useFetchPeriodically` directly:

```tsx
// Domain hook (useFleets.ts)
export const useFleets = (args: FleetsEndpointArgs): FleetLoad => {
  const pagination = useTablePagination<FleetList>();
  const [endpoint, debouncing] = useFleetsEndpoint({
    ...args,
    nextContinue: pagination.nextContinue,
  });
  const [data, isLoading, error, refetch, updating] = useFetchPeriodically<FleetList>(
    { endpoint },
    pagination.onPageFetched,
  );
  return {
    fleets: data?.items || [],
    isLoading,
    error,
    isUpdating: updating || debouncing,
    refetch,
    pagination,
  };
};

// Component consumes the domain hook
const { fleets, isLoading, error, pagination } = useFleets({ addDevicesSummary: true });
```
Reference: `components/Fleet/useFleets.ts`, `components/Device/DevicesPage/useDevices.ts`

### Mutations

Same `useFetch()` context for writes:

```tsx
const { post, put, patch, remove } = useFetch();

await post<Fleet>('fleets', resource);               // Create
await put<Fleet>(`fleets/${id}`, updated);           // Full replace
await patch<Fleet>(`fleets/${id}`, jsonPatchOps);    // Partial (JSON Patch array)
await remove<void>(`fleets/${id}`);                  // Delete
```

### Filter State

URL search params are the source of truth for filter and sort state. Never
store filter state in component state alone — it must survive navigation:

```tsx
const { router: { useSearchParams } } = useAppContext();
const [searchParams, setSearchParams] = useSearchParams();

const name = searchParams.get('name') || undefined;
// Updating params triggers endpoint rebuild and automatic refetch
setSearchParams(new URLSearchParams({ name: newValue }));
```
Reference: `components/Fleet/useFleets.ts` (`useFleetBackendFilters`)

### Pagination

The API uses **continue tokens**, not offset-based pagination:

```tsx
const pagination = useTablePagination<FleetList>();
// Pass pagination.nextContinue when building the endpoint
// Pass pagination.onPageFetched as the useFetchPeriodically callback
// Render: <TablePagination pagination={pagination} />
```

Page size: `PAGE_SIZE` (50) from `constants.ts`.

### Navigation

Use the typed `ROUTE` enum — never use react-router's navigation directly:

```tsx
import { useNavigate, Link, ROUTE } from '@flightctl/ui-components/hooks/useNavigate';

navigate(ROUTE.FLEETS);
navigate({ route: ROUTE.FLEET_DETAILS, postfix: fleetName });

<Link to={ROUTE.FLEETS}>Fleets</Link>
<Link to={{ route: ROUTE.FLEET_DETAILS, postfix: fleetName }}>View</Link>
```

Routes with a resource ID use `{ route, postfix }`. Routes without use the
enum directly. The `ROUTE` enum is the single source of truth for all
application paths.

## Wizards and Validation

Wizards compose three layers: **Formik** (form state + validation),
**PatternFly Wizard** (step navigation), and **FlightCtlWizardFooter**
(bridges the two). Never build a multi-step form without this structure.

### Wizard Skeleton

```tsx
<Formik<MyFormValues>
  initialValues={getInitialValues()}
  validationSchema={getValidationSchema(t)}
  validateOnMount
  onSubmit={async (values) => { /* post/patch, then navigate */ }}
>
  {({ errors }) => {
    const validStepIds = getValidStepIds(errors);
    return (
      <Wizard footer={<MyWizardFooter />}>
        <WizardStep id={stepOneId}
          isDisabled={isWizardStepDisabled(stepOneId, orderedIds, validStepIds)}>
          {currentStep?.id === stepOneId && <StepOneContent />}
        </WizardStep>
        {/* ... more steps ... */}
      </Wizard>
    );
  }}
</Formik>
```
Reference: `components/Fleet/CreateFleet/CreateFleetWizard.tsx`

### Step Validation Contract

Each step file exports a **step ID** and a **validation function**:

```tsx
export const generalInfoStepId = 'general-info';
export const isGeneralInfoStepValid = (errors: FormikErrors<FleetFormValues>) =>
  !errors.name && !errors.labels && !errors.fleetLabels;
```

The wizard root collects these into an ordered array. `isWizardStepDisabled`
(from `utils/wizards.ts`) disables any step whose predecessors are invalid.
The review/submit step is valid only when all other steps pass.

### Key Traps

- **Always render disabled steps** — use `isDisabled`, never conditionally
  omit `<WizardStep>`. Content inside is conditionally rendered with
  `{currentStep?.id === stepId && <Component />}`.
- **Use `Yup.lazy()`** for schemas where validation depends on other field
  values (e.g. advanced vs. basic config).
- **Reusable validators** live in `components/form/validations.ts` —
  check there before writing a new one (`validKubernetesDnsSubdomain`,
  `validLabelsSchema`, `validConfigTemplatesSchema`, etc.).
- **rjsf / DynamicForm** exists for JSON Schema-driven forms (catalog items).
  Don't reinvent schema-driven forms — use `components/DynamicForm/DynamicForm.tsx`.

## Internationalization

AGENTS.md covers the core rules (hardcoded keys, `npm run i18n`). Additional
constraints:

- **Interpolation syntax**: `t('Version {{ num }}', { num: version })` —
  double braces, not JSX expressions.
- **Components take translated strings**, never i18n keys. The caller runs
  `t()` and passes the result: `<ListPage title={t('Fleets')}>`.
- **Keys are flat** — `keySeparator: false` in the parser config. No dot
  notation nesting.
- **`npm run i18n` is part of `npm run lint`** — if you add or change a
  translation key in source, lint will fail until you run `npm run i18n` and
  commit the updated `translation.json`.

## Permissions

### Checking Permissions

Use `usePermissionsContext()` with `RESOURCE` and `VERB` enums from
`types/rbac.ts`:

```tsx
const { checkPermissions, loading } = usePermissionsContext();
const [canList, canCreate] = checkPermissions([
  { kind: RESOURCE.FLEET, verb: VERB.LIST },
  { kind: RESOURCE.FLEET, verb: VERB.CREATE },
]);
```

`checkPermissions` takes an array and returns a parallel boolean array.

### Page-Level Protection

Wrap entire pages with `PageWithPermissions` — it handles loading spinners
and access-denied states:

```tsx
<PageWithPermissions allowed={canList} loading={loading}>
  <FleetsContent />
</PageWithPermissions>
```

For button-level checks, conditionally render:

```tsx
{canCreate && <Button>{t('Create fleet')}</Button>}
```

Reference: `components/Catalog/ResourceCatalog/ResourceCatalogPage.tsx`,
`components/AuthProvider/AuthProvidersPage.tsx`

## Testing (Cypress E2E)

No unit or component test framework exists — the project tests exclusively
through Cypress e2e tests. Do not introduce Jest, Vitest, or
`@testing-library/react` unless explicitly asked.

### Test Structure

Tests live in `libs/cypress/e2e/{feature}/`. Every test file:

1. Calls `cy.loadApiInterceptors()` in the first `beforeEach`
2. Instantiates page objects and navigates in a second `beforeEach`
3. Uses page object getters for all selectors — never hardcode selectors
   in test files

```tsx
beforeEach(() => {
  cy.loadApiInterceptors();
});

beforeEach(() => {
  FleetsPage.visit();
  fleetsPage = new FleetsPage();
});
```

### Page Objects

Page objects live in `libs/cypress/pages/`. Pattern:

```tsx
export class FleetsPage {
  constructor() {
    cy.get('section').as(FleetsPage.name);
  }

  static visit() {
    cy.visit('/devicemanagement/fleets');
  }

  get createButton() {
    return cy.contains('button', 'Create');
  }

  fleetRow(name: string) {
    return cy.get('td[data-label="Name"]').contains(name);
  }
}
```

- Static `visit()` for navigation
- Constructor aliases the page container
- Getter-based selectors

### Selector Priority

1. `data-testid` attributes (most stable)
2. `aria-label` attributes (accessibility-based)
3. `cy.contains('element', 'text')` (for buttons/labels without IDs)
4. CSS/DOM selectors (last resort)

### API Mocking

All API calls are intercepted — tests never hit a real backend.
Interceptors live in `libs/cypress/support/interceptors/` and use regex
matchers from `matchers.ts` (`createListMatcher`, `createDetailMatcher`).
Wait for intercepts after user actions: `cy.wait('@create-new-fleet')`.
