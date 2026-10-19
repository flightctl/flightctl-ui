/**
 * Framework-agnostic navigation guard used when react-router Prompt/useBlocker
 * are unavailable (e.g. OpenShift Console BrowserRouter) or retired for a
 * single shared leave-confirmation path.
 */
export class NavigationGuardController {
  private lockCount = 0;
  private pending: (() => void) | null = null;
  private readonly listeners = new Set<() => void>();

  get isLocked(): boolean {
    return this.lockCount > 0;
  }

  get isBlocked(): boolean {
    return this.pending !== null;
  }

  /** Increment the lock while a dirty form is mounted. Returns unregister. */
  register(): () => void {
    this.lockCount += 1;
    this.notify();
    return () => {
      this.lockCount = Math.max(0, this.lockCount - 1);
      if (this.lockCount === 0) {
        this.pending = null;
      }
      this.notify();
    };
  }

  /**
   * Run `navigate` immediately when unlocked; otherwise hold it until
   * proceed() or reset().
   */
  tryNavigate(run: () => void): void {
    if (!this.isLocked) {
      run();
      return;
    }
    this.pending = run;
    this.notify();
  }

  proceed(): void {
    const fn = this.pending;
    this.pending = null;
    this.notify();
    fn?.();
  }

  reset(): void {
    this.pending = null;
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }
}
