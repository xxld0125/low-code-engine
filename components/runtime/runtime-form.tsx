'use client'

import { Form, FormProps } from '@/components/renderer/data-components'
import { useActionExecutor } from '@/lib/runtime/action-executor'
import { DataService } from '@/lib/services/data-service'
import { FormEvent, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { ActionConfig } from '@/types/editor'

interface RuntimeFormProps extends FormProps {
  componentId: string
  actions?: ActionConfig[]
}

export function RuntimeForm({ componentId, tableName, actions, ...props }: RuntimeFormProps) {
  const { executeAction } = useActionExecutor()
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!tableName) {
      toast.error('No table name configured for this form')
      return
    }

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      // 1. Insert data
      await DataService.insertRecord(tableName, data)
      toast.success('Record saved successfully')

      // 2. Trigger SUBMIT_FORM actions if any
      if (actions) {
        const submitActions = actions.filter((a) => a.trigger === 'onSubmit')
        for (const action of submitActions) {
          await executeAction(action, { formId: componentId, formData: data })
        }
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to save record')
    }
  }

  useEffect(() => {
    const eventName = `form:submit:${componentId}`
    const handleExternalSubmit = () => {
      if (formRef.current) {
        try {
          formRef.current.requestSubmit()
        } catch (error) {
          console.error('[RuntimeForm] Failed to request submit:', error)
        }
      } else {
        console.warn('[RuntimeForm] formRef is null')
      }
    }

    window.addEventListener(eventName, handleExternalSubmit)
    return () => {
      window.removeEventListener(eventName, handleExternalSubmit)
    }
  }, [componentId])

  return <Form ref={formRef} tableName={tableName} onSubmit={handleSubmit} {...props} />
}
