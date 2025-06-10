'use client'

import { useEffect, useState } from 'react'
import { API_ENDPOINTS } from '../../config/api'

type User = {
  id: number
  username: string
  email: string
  age: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    fetch(API_ENDPOINTS.USERS_LIST)
      .then(res => res.json())
      .then(data => setUsers(data))
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">用户列表</h1>
      <ul className="space-y-2">
        {users.map(user => (
          <li key={user.id} className="p-4 border rounded shadow">
            <div><strong>{user.username}</strong></div>
            <div>Email: {user.email}</div>
            <div>Age: {user.age}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
