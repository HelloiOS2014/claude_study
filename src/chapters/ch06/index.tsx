import { ReferenceSection } from '../../components/content/ReferenceSection'

export default function Ch06() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>6.1 Skills 是什么</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>6.2 写你的第一个 Skill</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>6.3 Skill 的作用域与优先级</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>6.4 从 Plugin 市场获取能力</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>6.5 常见问题排查</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <ReferenceSection version="Claude Code v1.x">
        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <p>SKILL.md 完整 frontmatter 字段、内置 Skills 列表、常用 Plugin 清单</p>
        </div>
      </ReferenceSection>
    </div>
  )
}
