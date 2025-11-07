/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SystemdActiveStateType } from './SystemdActiveStateType';
import type { SystemdEnableStateType } from './SystemdEnableStateType';
import type { SystemdLoadStateType } from './SystemdLoadStateType';
export type SystemdUnitStatus = {
  /**
   * The unit name (e.g., "sshd.service").
   */
  unit: string;
  /**
   * The human-readable description for the unit.
   */
  description: string;
  enableState: SystemdEnableStateType;
  loadState: SystemdLoadStateType;
  activeState: SystemdActiveStateType;
  /**
   * The low-level, unit-type-specific state.
   */
  subState: string;
};

