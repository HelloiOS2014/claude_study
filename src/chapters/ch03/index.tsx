import { ReferenceSection } from '../../components/content/ReferenceSection'

export default function Ch03() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>3.1 四轮 API 案例</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>3.2 三种控制模式</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>3.3 AI 生成代码的审查框架</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <ReferenceSection version="Claude Code v1.x">
        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <p>Vibe Coding 常见陷阱检查表</p>
        </div>
      </ReferenceSection>
    </div>
  )
}
