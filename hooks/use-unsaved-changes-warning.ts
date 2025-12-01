'use client'

import { useEffect } from 'react'

/**
 * 在页面有未保存更改时，提醒用户刷新/关闭页面会丢失数据
 * @param isDirty - 是否有未保存的更改
 */
export function useUnsavedChangesWarning(isDirty: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        // 标准做法：设置 returnValue
        event.preventDefault()
        event.returnValue = ''
        // 某些浏览器会忽略自定义消息，使用默认提示
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isDirty])
}
