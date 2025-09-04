import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ClientPreferencesForm } from "@/components/client-preferences-form"

export default function PreferencesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">Set Your Preferences</h1>
            <p className="text-muted-foreground text-lg">
              Help us find the perfect rental properties that match your needs and budget
            </p>
          </div>

          <ClientPreferencesForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
