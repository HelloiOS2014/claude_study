import { ReferenceSection } from '../../components/content/ReferenceSection'

export default function Ch08() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>8.1 为什么需要 Subagent</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>8.2 五种内置 Subagent</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>8.3 自定义 Agent</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>8.4 上下文摘要的局限</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <hr className="my-8" style={{ borderColor: 'var(--color-border)' }} />
      <div className="px-4 py-3 rounded-lg text-xs" style={{ background: 'var(--color-accent-subtle)', border: '1px solid var(--color-border-accent)' }}>
        <span style={{ color: 'var(--color-accent)' }}>实验性功能</span>
        <span className="ml-2" style={{ color: 'var(--color-text-secondary)' }}>以下内容基于 Agent Teams 实验性 API，可能随版本变化。</span>
      </div>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>8.5 从星型到网状</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>8.6 Teams 实战</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>8.7 高级模式</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <ReferenceSection version="Claude Code v1.x">
        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <p>自定义 Agent 完整 frontmatter（15 字段）、Teams 配置参考、Hook 事件 TeammateIdle/TaskCompleted</p>
        </div>
      </ReferenceSection>
    </div>
  )
}
