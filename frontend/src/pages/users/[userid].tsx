import { useRouter } from 'next/router'

const User = () => {
  const router = useRouter()
  const { userid } = router.query

  return <p>User: {userid}</p>
}

export default User