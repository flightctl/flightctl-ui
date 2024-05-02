/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ContainerStatus = {
  /**
   * Name of the container.
   */
  name: string;
  /**
   * ID of the container.
   */
  id: string;
  /**
   * Status of the container (e.g., running, stopped, etc.).
   */
  status: string;
  /**
   * Image of the container.
   */
  image: string;
  /**
   * Engine running the container (e.g., podman, crio, etc).
   */
  engine: string;
};

