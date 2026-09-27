import { Component, type ReactNode } from "react";

type Props = { fallback: ReactNode; children: ReactNode };

/** 子の描画で throw された失敗を受け、その区画だけを fallback に替える。 */
export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
