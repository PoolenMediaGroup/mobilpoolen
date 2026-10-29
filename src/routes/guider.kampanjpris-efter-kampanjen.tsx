import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/guider/kampanjpris-efter-kampanjen')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/guider/kampanjpris-efter-kampanjen"!</div>
}
