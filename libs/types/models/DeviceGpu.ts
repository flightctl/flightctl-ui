/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Information about a GPU device discovered on the device.
 */
export type DeviceGpu = {
  /**
   * Zero-based enumeration index of the GPU on the system, assigned in PCI bus discovery order.
   */
  index: number;
  /**
   * The GPU vendor name (e.g., "NVIDIA", "AMD", "Intel").
   */
  vendor?: string;
  /**
   * The GPU model name (e.g., "RTX 4090", "GA10B").
   */
  model?: string;
  /**
   * PCI device ID of the GPU, as read from the PCI configuration register (e.g., "0x2717").
   */
  pciDeviceId?: string;
  /**
   * PCI bus address in BDF notation (e.g., "0000:01:00.0").
   */
  pciAddress?: string;
  /**
   * PCI revision ID of the GPU (e.g., "0xa1").
   */
  pciRevisionId?: string;
  /**
   * PCI vendor ID of the GPU (e.g., "0x10de" for NVIDIA).
   */
  pciVendorId?: string;
  /**
   * The amount of GPU memory in bytes.
   */
  memoryBytes?: number;
  /**
   * GPU microarchitecture generation name as defined in the hardware map or platform lookup table (e.g., "Ada", "Ampere", "Volta", "Maxwell" for NVIDIA; "RDNA3", "CDNA3" for AMD). This is the vendor marketing name for the GPU microarchitecture, not the host CPU ISA or a compute-capability version string.
   */
  arch?: string;
  /**
   * Vendor-specific GPU capability identifiers sourced from the hardware map. Values are lowercase tokens describing supported compute or display features (e.g., "cuda", "rocm", "opencl", "sriov", "mig"). The vocabulary is extensible and determined by the hardware map; no fixed enum is enforced.
   */
  features?: Array<string>;
};

