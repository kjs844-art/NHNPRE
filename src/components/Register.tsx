import { useState } from 'react'

interface Props {
  onRegister: (name: string) => void
}

export default function Register({ onRegister }: Props) {
  const [value, setValue] = useState('')
  const submit = () => {
    const name = value.trim()
    if (name.length === 0) return
    onRegister(name.slice(0, 10))
  }

  return (
    <div className="screen register-screen">
      <p className="register-sys">한빛빌라 통합관제 v2.3</p>
      <h2 className="register-title">근무자 등록</h2>
      <p className="register-desc">야간 관제 기록에 사용할 이름을 입력하십시오.</p>
      <input
        className="register-input"
        value={value}
        maxLength={10}
        placeholder="이름"
        autoFocus
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
        }}
      />
      <button className="btn-primary" onClick={submit} disabled={value.trim().length === 0}>
        등록
      </button>
      <p className="register-note">* 원격(재택) 근무 계정으로 등록됩니다.</p>
    </div>
  )
}
