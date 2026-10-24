import { Link } from 'react-router'
import { Compass } from 'lucide-react'
import EmptyState from '@/components/EmptyState'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function NotFoundPage() {
  usePageTitle('Lost in space')
  return (
    <div className="px-5 pt-16">
      <EmptyState
        icon={Compass}
        headingLevel={1}
        title="Lost among the stars"
        message="This little corner of our universe doesn't exist (yet)."
        action={
          <Link to="/" className="btn btn-primary">
            Take me home ♡
          </Link>
        }
      />
    </div>
  )
}
