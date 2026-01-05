import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle,
  Home,
  Palette,
  TrendingUp,
  Award,
  BookOpen,
  Instagram,
  Mail,
  Star,
} from "lucide-react";

async function getFeaturedCourses() {
  return db.course.findMany({
    where: { isPublished: true },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      chapters: {
        where: { isPublished: true },
        include: {
          lessons: {
            where: { isPublished: true },
          },
        },
      },
    },
  });
}

export default async function LandingPage() {
  const session = await auth();
  const courses = await getFeaturedCourses();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/aspnospace.png"
              alt="The Staging Course"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span className="text-xl font-semibold tracking-tight">
              The Staging Course
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/courses"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Courses
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {session?.user ? (
              <Button asChild>
                <Link href="/dashboard">My Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:flex">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/courses">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 via-background to-accent/30" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="container relative mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-primary mb-6">
              Transform Spaces. Transform Lives.
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
              Master the Art of{" "}
              <span className="text-primary">Home Staging</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Learn professional techniques to transform any space into a
              buyer&apos;s dream. From color theory to furniture placement,
              unlock the secrets of successful home staging.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="text-base px-8" asChild>
                <Link href="/courses">
                  Explore Courses
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8"
                asChild
              >
                <Link href="#about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-20 md:py-32 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium uppercase tracking-widest text-primary mb-4">
              What You&apos;ll Learn
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything You Need to Succeed
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Home className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Space Planning</h3>
              <p className="text-muted-foreground text-sm">
                Learn to optimize layouts and create flow that makes any room
                feel spacious and inviting.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Palette className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Color Theory</h3>
              <p className="text-muted-foreground text-sm">
                Master the psychology of color and how to create palettes that
                appeal to buyers.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3">ROI Maximizing</h3>
              <p className="text-muted-foreground text-sm">
                Discover budget-friendly staging techniques that deliver maximum
                impact and value.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Certification</h3>
              <p className="text-muted-foreground text-sm">
                Earn a professional certificate to showcase your staging
                expertise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About the Instructor */}
      <section id="about" className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-primary/20 to-accent overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src="/aspnospace.png"
                    alt=""
                    width={96}
                    height={96}
                    className="h-24 w-24 opacity-30"
                  />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-2xl bg-primary/10 -z-10" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-primary mb-4">
                Your Instructor
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                Learn from an Industry Professional
              </h2>
              <p className="text-muted-foreground mb-6">
                With years of experience transforming properties across the
                country, I&apos;ve helped countless homes sell faster and for
                more money through strategic staging.
              </p>
              <p className="text-muted-foreground mb-8">
                Now, I&apos;m sharing everything I&apos;ve learned—the
                techniques, the shortcuts, and the industry secrets—so you can
                build your own successful staging career or simply transform
                your own space.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  <span>Professional home stager & interior designer</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  <span>Hundreds of properties staged and sold</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  <span>Featured in top real estate publications</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {courses.length > 0 && (
        <section className="py-20 md:py-32 bg-card">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-sm font-medium uppercase tracking-widest text-primary mb-4">
                Our Courses
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Start Your Journey Today
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => {
                const lessonCount = course.chapters.reduce(
                  (acc, chapter) => acc + chapter.lessons.length,
                  0
                );

                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    className="group rounded-2xl border bg-background overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    <div className="aspect-video relative bg-muted">
                      {course.imageUrl ? (
                        <Image
                          src={course.imageUrl}
                          alt={course.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BookOpen className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      {course.description && (
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                          {course.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {course.chapters.length} chapters · {lessonCount}{" "}
                          lessons
                        </span>
                        <span className="font-semibold text-primary">
                          {course.price > 0
                            ? `$${course.price}`
                            : "Free"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-12">
              <Button size="lg" variant="outline" asChild>
                <Link href="/courses">
                  View All Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium uppercase tracking-widest text-primary mb-4">
              Success Stories
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              What Our Students Say
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-card border">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-primary fill-primary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6">
                &quot;This course completely changed how I approach staging.
                The tips on color coordination alone were worth the entire
                investment.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">JM</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Jessica M.</p>
                  <p className="text-xs text-muted-foreground">
                    Real Estate Agent
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8 rounded-2xl bg-card border">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-primary fill-primary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6">
                &quot;I started my staging business after completing this
                course. The practical, hands-on lessons gave me the confidence
                to succeed.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">ST</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Sarah T.</p>
                  <p className="text-xs text-muted-foreground">
                    Staging Business Owner
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8 rounded-2xl bg-card border">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-primary fill-primary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6">
                &quot;Even as someone who just wanted to stage my own home for
                sale, the value here is incredible. My house sold in just one
                week!&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">MR</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Michael R.</p>
                  <p className="text-xs text-muted-foreground">Homeowner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Ready to Transform Your Future?
            </h2>
            <p className="text-lg opacity-90 mb-10">
              Join hundreds of students who have already started their staging
              journey. Your new career or dream home is just one course away.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="text-base px-8"
              asChild
            >
              <Link href="/courses">
                Browse Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-16 border-t">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image
                src="/aspnospace.png"
                alt="The Staging Course"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-xl font-semibold">The Staging Course</span>
            </Link>
              <p className="text-muted-foreground max-w-md mb-6">
                Professional home staging education to help you transform
                spaces and build your dream career in interior design.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://instagram.com/aspirationalspace"
            target="_blank"
            rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Instagram className="h-5 w-5" />
          </a>
          <a
                  href="mailto:info@aspirationalspace.com"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <Link href="/courses" className="hover:text-foreground transition-colors">
                    Courses
                  </Link>
                </li>
                <li>
                  <Link href="#about" className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-foreground transition-colors">
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <a
                    href="mailto:info@aspirationalspace.com"
                    className="hover:text-foreground transition-colors"
                  >
                    info@aspirationalspace.com
                  </a>
                </li>
                <li>
                  <a
                    href="tel:6155820574"
                    className="hover:text-foreground transition-colors"
                  >
                    615.582.0574
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} The Staging Course. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
