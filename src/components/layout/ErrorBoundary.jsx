import { Component } from 'react'
import { RotateCw } from 'lucide-react'
import Logo from '@/components/ui/Logo'

/**
 * 최상위 에러 경계. 렌더 중 예외가 나도 앱 전체가 흰 화면이 되지 않도록
 * 복구 화면을 보여준다. (육아 중 급히 기록해야 할 때 흰 화면 방지)
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || '' }
  }

  componentDidCatch(error, info) {
    // 개발 중 원인 파악용 (프로덕션에서도 콘솔에는 남긴다)
    console.error('[Sol-Log] 렌더 오류:', error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#FDFBF7] px-8">
        <div className="text-center">
          <Logo size={64} className="mx-auto" />
          <p className="mt-4 text-sm font-semibold text-stone-800">
            잠깐 문제가 생겼어요.
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
            새로고침하면 대부분 해결돼요. 계속되면 잠시 후 다시 시도해주세요.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#3D8B5A] px-6 text-sm font-semibold text-white"
          >
            <RotateCw size={16} />
            새로고침
          </button>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary
