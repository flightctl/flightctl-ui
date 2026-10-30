import { describe, expect, it, vi } from 'vitest';

import { NavigationGuardController } from './NavigationGuardController';

describe('NavigationGuardController', () => {
  it('When unlocked, tryNavigate runs immediately', () => {
    const controller = new NavigationGuardController();
    const run = vi.fn();

    controller.tryNavigate(run);

    expect(run).toHaveBeenCalledOnce();
    expect(controller.isBlocked).toBe(false);
  });

  it('When locked, tryNavigate holds navigation until proceed', () => {
    const controller = new NavigationGuardController();
    const unregister = controller.register();
    const run = vi.fn();

    controller.tryNavigate(run);

    expect(run).not.toHaveBeenCalled();
    expect(controller.isBlocked).toBe(true);

    controller.proceed();

    expect(run).toHaveBeenCalledOnce();
    expect(controller.isBlocked).toBe(false);

    unregister();
  });

  it('When locked, reset discards the pending navigation', () => {
    const controller = new NavigationGuardController();
    const unregister = controller.register();
    const run = vi.fn();

    controller.tryNavigate(run);
    controller.reset();

    expect(run).not.toHaveBeenCalled();
    expect(controller.isBlocked).toBe(false);

    unregister();
  });

  it('When lock is cleared, subsequent navigations proceed without a dialog', () => {
    const controller = new NavigationGuardController();
    const unregister = controller.register();
    const blocked = vi.fn();
    const afterUnlock = vi.fn();

    controller.tryNavigate(blocked);
    expect(controller.isBlocked).toBe(true);

    unregister();
    expect(controller.isLocked).toBe(false);
    expect(controller.isBlocked).toBe(false);

    controller.tryNavigate(afterUnlock);
    expect(afterUnlock).toHaveBeenCalledOnce();
  });

  it('When multiple locks are registered, unlock requires all to unregister', () => {
    const controller = new NavigationGuardController();
    const first = controller.register();
    const second = controller.register();

    expect(controller.isLocked).toBe(true);
    first();
    expect(controller.isLocked).toBe(true);
    second();
    expect(controller.isLocked).toBe(false);
  });

  it('When subscribers are registered, they are notified on lock and block changes', () => {
    const controller = new NavigationGuardController();
    const listener = vi.fn();
    const unsubscribe = controller.subscribe(listener);

    controller.register();
    expect(listener).toHaveBeenCalled();

    listener.mockClear();
    controller.tryNavigate(() => undefined);
    expect(listener).toHaveBeenCalled();

    unsubscribe();
    listener.mockClear();
    controller.reset();
    expect(listener).not.toHaveBeenCalled();
  });

  it('When still locked, a pending navigation survives an extra register/unregister pair', () => {
    const controller = new NavigationGuardController();
    const keepLocked = controller.register();
    const run = vi.fn();

    controller.tryNavigate(run);
    expect(controller.isBlocked).toBe(true);

    // Simulates a consumer re-subscribing without releasing the form lock.
    const transient = controller.register();
    transient();

    expect(controller.isLocked).toBe(true);
    expect(controller.isBlocked).toBe(true);

    controller.proceed();
    expect(run).toHaveBeenCalledOnce();

    keepLocked();
  });
});
