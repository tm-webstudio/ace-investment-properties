import { Card, CardContent } from "@/components/ui/card"

interface Step {
  label: string
}

interface FormProgressBarProps {
  currentStep: number
  totalSteps: number
  steps: Step[]
}

export function FormProgressBar({ currentStep, totalSteps, steps }: FormProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100

  // Calculate the width of the active progress line based on current step
  const getProgressWidth = () => {
    if (totalSteps === 4) {
      switch (currentStep) {
        case 1: return 'calc(12.5% - 2px)'
        case 2: return 'calc(37.5% - 2px)'
        case 3: return 'calc(62.5% - 2px)'
        case 4: return 'calc(100% - 1rem)'
        default: return '0'
      }
    }
    // For other step counts, calculate proportionally
    const stepPercentage = 100 / totalSteps
    const completedPercentage = (currentStep - 1) * stepPercentage
    const currentStepProgress = stepPercentage / 2 // Fill half of current step
    return `calc(${completedPercentage + currentStepProgress}% - ${currentStep === totalSteps ? '1rem' : '2px'})`
  }

  return (
    <Card>
      <CardContent className="px-6">
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Step {currentStep} of {totalSteps}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="space-y-4">
            {/* Progress container using CSS Grid */}
            <div className={`grid gap-8 relative px-4`} style={{ gridTemplateColumns: `repeat(${totalSteps}, 1fr)` }}>
              {/* Background progress line connecting through dots */}
              <div className="absolute h-2 bg-muted-foreground/20 rounded-full left-2 right-2" style={{ top: '5px' }}></div>

              {/* Active progress line */}
              <div
                className="absolute h-2 bg-primary rounded-full transition-all duration-300"
                style={{
                  top: '5px',
                  left: '0.5rem',
                  width: getProgressWidth()
                }}
              ></div>

              {/* Step indicators */}
              {steps.map((step, index) => {
                const stepNumber = index + 1
                return (
                  <div key={stepNumber} className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full border-2 bg-white ${currentStep >= stepNumber ? 'border-primary' : 'border-muted-foreground/30'} relative z-10 mb-2`}>
                      {currentStep >= stepNumber && <div className="w-full h-full rounded-full bg-primary scale-50"></div>}
                    </div>
                    <span className="text-xs text-muted-foreground text-center">{step.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
