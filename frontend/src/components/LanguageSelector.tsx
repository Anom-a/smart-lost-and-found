import React from 'react'
import { useTranslation } from 'react-i18next'

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation()

  const change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value)
  }

  return (
    <select onChange={change} value={i18n.language} className="border rounded p-1">
      <option value="en">English</option>
      <option value="am">አማርኛ</option>
    </select>
  )
}
