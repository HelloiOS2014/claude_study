import { ReferenceSection } from '../../components/content/ReferenceSection'

export default function Ch10() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>10.1 三个核心原则</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>10.2 设计你自己的工作流</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>10.3 社区方法论案例研究</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>10.4 反模式</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <ReferenceSection version="Claude Code v1.x">
        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <p>GSD / BMAD / Writer-Reviewer / RIPER-5 项目链接、适用场景对比表、成本估算</p>
        </div>
      </ReferenceSection>
    </div>
  )
}
