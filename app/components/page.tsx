'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, ChevronDown } from 'lucide-react'

export default function ComponentsShowcase() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-accent"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold">Component Showcase</h1>
          <p className="mt-2 text-muted-foreground">
            A visual demonstration of all UI components following the design system.
          </p>
        </div>

        <div className="space-y-16">
          {/* Buttons Section */}
          <section>
            <h2 className="mb-6 text-2xl font-semibold">Buttons</h2>
            <Card>
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
                <CardDescription>Flat design with 2px borders, no shadows</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Button>Default Button</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">
                    <ChevronDown size={16} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button disabled>Disabled</Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Cards Section */}
          <section>
            <h2 className="mb-6 text-2xl font-semibold">Cards</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>
                    Cards use 2px borders with no border radius for a sharp, professional look.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Content area with generous 32px padding. No shadows used - definition comes from
                    strong borders.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feature Card</CardTitle>
                  <CardDescription>With accent border showcase</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-accent bg-accent/10 p-4">
                    <p className="text-sm font-medium">
                      Accent color (#16AA98) used for highlights
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Form Elements Section */}
          <section>
            <h2 className="mb-6 text-2xl font-semibold">Form Elements</h2>
            <Card>
              <CardHeader>
                <CardTitle>Inputs & Labels</CardTitle>
                <CardDescription>Clean form controls with strong borders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" type="text" placeholder="John Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Input id="message" placeholder="Type your message..." />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms" className="cursor-pointer">
                    Accept terms and conditions
                  </Label>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Badges Section */}
          <section>
            <h2 className="mb-6 text-2xl font-semibold">Badges</h2>
            <Card>
              <CardHeader>
                <CardTitle>Badge Variants</CardTitle>
                <CardDescription>Sharp-edged status indicators</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </CardContent>
            </Card>
          </section>

          {/* Dropdown & Toast Section */}
          <section>
            <h2 className="mb-6 text-2xl font-semibold">Interactive Components</h2>
            <Card>
              <CardHeader>
                <CardTitle>Dropdown Menu & Toast</CardTitle>
                <CardDescription>Context menus and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        Open Menu
                        <ChevronDown size={16} className="ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Profile</DropdownMenuItem>
                      <DropdownMenuItem>Settings</DropdownMenuItem>
                      <DropdownMenuItem>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    onClick={() =>
                      toast.success('Toast notification!', {
                        description: 'This is a toast message with our custom styling.',
                      })
                    }
                  >
                    Show Toast
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Color Palette Section */}
          <section>
            <h2 className="mb-6 text-2xl font-semibold">Color System</h2>
            <Card>
              <CardHeader>
                <CardTitle>Design Tokens</CardTitle>
                <CardDescription>Three-color palette with semantic usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="border-2 border-foreground p-6">
                    <div className="mb-2 h-12 bg-foreground"></div>
                    <p className="text-sm font-medium">Primary (#383838)</p>
                    <p className="text-xs text-muted-foreground">Text, borders, UI elements</p>
                  </div>
                  <div className="border-2 border-foreground p-6">
                    <div className="mb-2 h-12 border-2 border-foreground bg-background"></div>
                    <p className="text-sm font-medium">Background (#F4EFEA)</p>
                    <p className="text-xs text-muted-foreground">Page background, surfaces</p>
                  </div>
                  <div className="border-2 border-foreground p-6">
                    <div className="mb-2 h-12 bg-accent"></div>
                    <p className="text-sm font-medium">Accent (#16AA98)</p>
                    <p className="text-xs text-muted-foreground">Highlights, CTAs, features</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Design Principles */}
          <section>
            <h2 className="mb-6 text-2xl font-semibold">Design Principles</h2>
            <Card>
              <CardHeader>
                <CardTitle>Key Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 bg-accent"></span>
                    <span>
                      <strong>Flat Design:</strong> No shadows or gradients - use borders for
                      definition
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 bg-accent"></span>
                    <span>
                      <strong>Sharp Corners:</strong> 0px border radius for professional aesthetic
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 bg-accent"></span>
                    <span>
                      <strong>Strong Borders:</strong> 1.5-2px solid borders (#383838)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 bg-accent"></span>
                    <span>
                      <strong>Generous Spacing:</strong> 32-64px section padding, ample whitespace
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 bg-accent"></span>
                    <span>
                      <strong>System Fonts:</strong> No custom fonts - rely on system font stack
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 bg-accent"></span>
                    <span>
                      <strong>Minimal Color Palette:</strong> Three colors only - #383838, #F4EFEA,
                      #16AA98
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}
