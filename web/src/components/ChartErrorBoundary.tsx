import { Component, type ReactNode } from 'react'
import LoadErrorBanner from './LoadErrorBanner'

interface ChartErrorBoundaryProps {
  children: ReactNode
  onReload?: () => void
}

interface ChartErrorBoundaryState {
  hasError: boolean
}

// Catches a failed lazy chart chunk so only the trend slot shows an error.
// React reports the caught error to console.error itself; the message is never shown.
class ChartErrorBoundary extends Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  state: ChartErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ChartErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <LoadErrorBanner variant="chart" onReload={this.props.onReload} />
    }
    return this.props.children
  }
}

export default ChartErrorBoundary
