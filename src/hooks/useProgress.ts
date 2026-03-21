import { useState, useEffect, useCallback } from 'react'

interface Progress {
  [chapterId: string]: {
    started: boolean
    completed: boolean
    lastVisited: number
  }
}

const STORAGE_KEY = 'claude-tutorial-progress'

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  const markStarted = useCallback((chapterId: string) => {
    setProgress(prev => ({
      ...prev,
      [chapterId]: { ...prev[chapterId], started: true, lastVisited: Date.now() },
    }))
  }, [])

  const markCompleted = useCallback((chapterId: string) => {
    setProgress(prev => ({
      ...prev,
      [chapterId]: { ...prev[chapterId], started: true, completed: true, lastVisited: Date.now() },
    }))
  }, [])

  const isCompleted = useCallback((chapterId: string) => {
    return progress[chapterId]?.completed ?? false
  }, [progress])

  const isStarted = useCallback((chapterId: string) => {
    return progress[chapterId]?.started ?? false
  }, [progress])

  const completedCount = Object.values(progress).filter(p => p.completed).length

  return { progress, markStarted, markCompleted, isCompleted, isStarted, completedCount }
}
