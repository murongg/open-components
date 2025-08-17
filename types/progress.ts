export interface ProgressStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  progress: number; // 0-100
  message?: string;
  result?: any;
  error?: string;
  startTime?: number;
  endTime?: number;
}

export interface ProgressState {
  steps: ProgressStep[];
  currentStep: string | null;
  overallProgress: number;
  isComplete: boolean;
  hasError: boolean;
  totalSteps: number;
  completedSteps: number;
}

export type ProgressCallback = (state: ProgressState) => void;

export class ProgressManager {
  private state: ProgressState;
  private callback?: ProgressCallback;

  constructor(steps: Omit<ProgressStep, 'status' | 'progress' | 'startTime' | 'endTime'>[], callback?: ProgressCallback) {
    this.state = {
      steps: steps.map(step => ({
        ...step,
        status: 'pending',
        progress: 0,
      })),
      currentStep: null,
      overallProgress: 0,
      isComplete: false,
      hasError: false,
      totalSteps: steps.length,
      completedSteps: 0,
    };
    this.callback = callback;
  }

  startStep(stepId: string, message?: string): void {
    const stepIndex = this.state.steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return;

    this.state.steps[stepIndex] = {
      ...this.state.steps[stepIndex],
      status: 'in_progress',
      progress: 0,
      message,
      startTime: Date.now(),
    };
    
    this.state.currentStep = stepId;
    this.updateOverallProgress();
    this.notifyCallback();
  }

  updateStepProgress(stepId: string, progress: number, message?: string): void {
    const stepIndex = this.state.steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return;

    this.state.steps[stepIndex] = {
      ...this.state.steps[stepIndex],
      progress: Math.min(100, Math.max(0, progress)),
      message,
    };
    
    this.updateOverallProgress();
    this.notifyCallback();
  }

  completeStep(stepId: string, result?: any, message?: string): void {
    const stepIndex = this.state.steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return;

    this.state.steps[stepIndex] = {
      ...this.state.steps[stepIndex],
      status: 'completed',
      progress: 100,
      result,
      message: message || '完成',
      endTime: Date.now(),
    };

    this.state.completedSteps++;
    
    // 检查是否所有步骤都完成
    if (this.state.completedSteps === this.state.totalSteps) {
      this.state.isComplete = true;
      this.state.currentStep = null;
    }
    
    this.updateOverallProgress();
    this.notifyCallback();
  }

  errorStep(stepId: string, error: string): void {
    const stepIndex = this.state.steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return;

    this.state.steps[stepIndex] = {
      ...this.state.steps[stepIndex],
      status: 'error',
      error,
      endTime: Date.now(),
    };

    this.state.hasError = true;
    this.state.currentStep = null;
    this.updateOverallProgress();
    this.notifyCallback();
  }

  private updateOverallProgress(): void {
    const totalProgress = this.state.steps.reduce((sum, step) => sum + step.progress, 0);
    this.state.overallProgress = Math.round(totalProgress / this.state.totalSteps);
  }

  private notifyCallback(): void {
    if (this.callback) {
      this.callback({ ...this.state });
    }
  }

  getState(): ProgressState {
    return { ...this.state };
  }

  getStep(stepId: string): ProgressStep | undefined {
    return this.state.steps.find(step => step.id === stepId);
  }

  reset(): void {
    this.state.steps.forEach(step => {
      step.status = 'pending';
      step.progress = 0;
      step.message = undefined;
      step.result = undefined;
      step.error = undefined;
      step.startTime = undefined;
      step.endTime = undefined;
    });
    
    this.state.currentStep = null;
    this.state.overallProgress = 0;
    this.state.isComplete = false;
    this.state.hasError = false;
    this.state.completedSteps = 0;
    
    this.notifyCallback();
  }
}
