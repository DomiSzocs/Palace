import Link from "next/link";

export default function Home() {
  return (
      <div>
          <Link href={'/host'}>Host a game</Link>
          <Link href={'/join'}>Join a game</Link>
          <Link href={'/find'}>Find a game</Link>
      </div>
  )
}
