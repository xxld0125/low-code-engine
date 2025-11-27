'use client'

import { createContext, useContext } from 'react'

interface FormContextType {
  formId: string | null
}

const FormContext = createContext<FormContextType>({
  formId: null,
})

export function useFormContext() {
  return useContext(FormContext)
}

export const FormProvider = FormContext.Provider
