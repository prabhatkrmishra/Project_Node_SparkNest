import { Component, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: "center" }}>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <a href="/">Go home</a>
        </div>
      );
    }
    return this.props.children;
  }
}
