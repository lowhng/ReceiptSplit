"use client";

import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { cn } from "@/lib/utils";
import { ArrowUp, Receipt, Menu, X } from "lucide-react";
import Link from "next/link";

const sections = [
  {
    id: "overview",
    title: "Overview",
    content: (
      <>
        <p className="mb-4">
          ReSplit is a receipt scanning and bill splitting application designed
          to make sharing expenses with friends simple and hassle-free. With
          ReSplit, you can quickly scan receipts, automatically extract items,
          assign them to different people, and calculate how much each person
          owes.
        </p>
        <p className="mb-4">
          Whether you're dining out with friends, sharing groceries with
          flatmates, or splitting travel expenses, ReSplit eliminates the
          headache of manual calculations and ensures everyone pays their fair
          share.
        </p>
      </>
    ),
  },
  {
    id: "getting-started",
    title: "Getting Started",
    content: (
      <>
        <h3 className="text-lg font-medium mb-2">1. Capture a Receipt</h3>
        <p className="mb-4">
          Start by taking a photo of your receipt or uploading one from your
          gallery. ReSplit will automatically process the image and extract all
          items and their prices.
        </p>

        <h3 className="text-lg font-medium mb-2">2. Set Up Your Split</h3>
        <p className="mb-4">
          Select how many friends you're splitting with (up to 4) and optionally
          enter their initials for easier identification. You can also select
          your preferred currency at the bottom of the screen - even though it
          will try to predict your currency based on where you're at.
        </p>

        <h3 className="text-lg font-medium mb-2">3. Assign Items</h3>
        <p className="mb-4">
          Once your receipt is processed, you'll see all items listed. Tap on
          each item to assign it to yourself, a specific friend, or mark it as
          shared. For shared items, you can adjust the split percentages (only
          if sharing with one friend).
        </p>

        <h3 className="text-lg font-medium mb-2">4. Review and Share</h3>
        <p className="mb-4">
          Go to the Split Summary tab to see a breakdown of what each person
          owes. You can adjust tax and tips settings, save the receipt for later 
          (if saved as a web app on your phone), or share the summary with your friends.
        </p>
      </>
    ),
  },
  {
    id: "how-it-works",
    title: "How It Works",
    content: (
      <>
        <h3 className="text-lg font-medium mb-2">Receipt Processing</h3>
        <p className="mb-4">
          ReSplit uses advanced AI models to analyze your receipt images.
          Currently, all models are free to use during our promotional period.
          In the future, premium models offering enhanced accuracy and faster
          processing for complex receipts may require a subscription.
        </p>

        <h3 className="text-lg font-medium mb-2">Item Assignment</h3>
        <p className="mb-4">
          After processing, you can assign each item to yourself, a friend, or
          mark it as shared. For shared items, you can specify custom split
          percentages (for splitting among one friend) or use an equal split.
        </p>

        <h3 className="text-lg font-medium mb-2">Tax and Tip Handling</h3>
        <p className="mb-4">
          ReSplit allows you to add tax and tip amounts to your bill and
          distribute them proportionally among all participants or include them
          in specific calculations. Tax is entered in amount, 
          while tips have both amount and percentage. In countries where you 
          have service charges instead of tips, you can use the tips percentage 
          too.
        </p>

        <h3 className="text-lg font-medium mb-2">Data Storage</h3>
        <p className="mb-4">
          In order for the save receipt function to work, you need to store the app as a web app.
          All receipt data is stored locally on your device for now. You can save
          receipts for future reference and load them again when needed.
        </p>
      </>
    ),
  },
  {
    id: "faqs",
    title: "FAQs",
    content: (
      <>
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-1">Is ReSplit free to use?</h3>
          <p>
            Yes, ReSplit is currently free to use for a limited time. In the
            future, premium features like enhanced AI models may require a
            subscription (I'm covering the cost now T.T).
          </p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-medium mb-1">How to save the website as a Web App?</h3>
          <p>
            I am working to see if a simple way can be introduced. For now, 
            go to your browser on your mobile phone and find an option to "Add to Home Screen".
            IPhone users can do that by pressing the export logo, then press on the 
            "Add to Home Screen" option.
          </p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-medium mb-1">
            How accurate is the receipt scanning?
          </h3>
          <p>
            ReSplit's accuracy depends on the quality of the receipt image and
            the complexity of the receipt. For best results, ensure good
            lighting and a clear, flat image of the receipt. The premium model 
            also generally performs better than the free model.
          </p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-medium mb-1">
            Can I edit items after scanning?
          </h3>
          <p>
            Not at the moment. I am however looking to get it implemented soon.
          </p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-medium mb-1">
            How many friends can I split with?
          </h3>
          <p>Currently, ReSplit supports splitting with up to 4 friends.</p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-medium mb-1">
            What currencies are supported?
          </h3>
          <p>
            ReSplit supports multiple currencies including USD, EUR, GBP, JPY,
            AUD, CAD, CHF, CNY, INR, SGD, and MYR. The app automatically detects
            your local currency.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "privacy-security",
    title: "Privacy & Security",
    content: (
      <>
        <h3 className="text-lg font-medium mb-2">Data Storage</h3>
        <p className="mb-4">
          ReSplit stores all your receipt data locally on your device. We do not
          store your receipts or personal information on our servers.
        </p>

        <h3 className="text-lg font-medium mb-2">Receipt Processing</h3>
        <p className="mb-4">
          When you scan a receipt, the image is temporarily sent to our AI
          service provider for processing. The image is not stored permanently
          and is deleted after processing. Free models might use the data for AI
          training, while premium models do not train on your data 
          (as per their respective policies for API usage).
        </p>

        <h3 className="text-lg font-medium mb-2">
          No Account Required (Currently)
        </h3>
        <p className="mb-4">
          ReSplit currently does not require you to create an account. In the
          future, account creation may be added to support subscription
          features, but we'll always respect your privacy.
        </p>

        <h3 className="text-lg font-medium mb-2">Data Sharing</h3>
        <p className="mb-4">
          When you use the share feature, ReSplit only shares the summary of who
          owes what. No receipt details or images are shared.
        </p>
      </>
    ),
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    content: (
      <>
        <h3 className="text-lg font-medium mb-2">
          Receipt Not Scanning Properly
        </h3>
        <p className="mb-4">If your receipt isn't being scanned correctly:</p>
        <ul className="list-disc pl-5 mt-2 mb-4">
          <li>Ensure good lighting with no shadows across the receipt</li>
          <li>Place the receipt on a flat, contrasting surface</li>
          <li>Make sure the entire receipt is visible in the frame</li>
          <li>Try using the premium AI model for better accuracy</li>
        </ul>

        <h3 className="text-lg font-medium mb-2">Missing or Incorrect Items</h3>
        <p className="mb-4">
          If there are extra items that isn't an item (for example - tax),
          you can simply not assign it to anyone and it will not be included.
          For items displayed incorrectly, I will be looking to add this 
          functionality in near future, for now taking a clearer picture might work.
        </p>

        <h3 className="text-lg font-medium mb-2">App Performance Issues</h3>
        <p className="mb-4">In the rare event that the app is running slowly or crashing:</p>
        <ul className="list-disc pl-5 mt-2 mb-4">
          <li>Refresh the page</li>
          <li>Clear your browser cache</li>
          <li>Try using a different browser</li>
        </ul>

        <h3 className="text-lg font-medium mb-2">Sharing Not Working</h3>
        <p className="mb-4">
          If you're unable to share the split summary, your browser might not
          support the Web Share API. Try using the "Export CSV" or "Export
          Image" options instead.
        </p>
      </>
    ),
  },
  {
    id: "contact-feedback",
    title: "Contact & Feedback",
    content: (
      <>
        <p className="mb-4">
          I am constantly working to improve ReSplit and would love to hear
          your feedback, suggestions, or bug reports.
        </p>

        <h3 className="text-lg font-medium mb-2">Contact Us</h3>
        <p className="mb-4">
          Have an idea for a new feature? Encounter any issues while using ReSplit?
          Please let me know!
          
          For support, feedback, or inquiries, please contact me at:
          <br />
          <a
            href="mailto:weihong.work@outlook.com"
            className="text-primary hover:underline"
          >
            weihong.work@outlook.com
          </a>
        </p>
      </>
    ),
  },
  {
    id: "changelog",
    title: "Changelog",
    content: (
      <>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-1">Version 0.1.2 (Beta)</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Released: May 2025
          </p>
          <ul className="list-disc pl-5">
            <li>Beta testing phase</li>
            <li>Receipt scanning and item extraction</li>
            <li>Support for splitting with up to 4 friends</li>
            <li>Item assignment and custom split percentages</li>
            <li>Tax and tip adjustments</li>
            <li>Save and load receipts</li>
            <li>Export to CSV and image</li>
            <li>Multiple currency support</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-1">Upcoming Features</h3>
          <ul className="list-disc pl-5">
            <li>Support for more than 4 friends</li>
            <li>Editing of Incorrect Items</li>
            <li>Receipt history and statistics</li>
            <li>Group management</li>
            <li>Dark mode support</li>
            <li>User accounts and cloud sync</li>
            <li>Premium subscription options</li>
          </ul>
        </div>
      </>
    ),
  },
];

export default function WikiPage() {
  const [activeSection, setActiveSection] = React.useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const [showScrollToTop, setShowScrollToTop] = React.useState(false);

  // Handle scroll to section
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const sectionElement = sectionRefs.current[sectionId];
    if (sectionElement) {
      // Add offset for the sticky header
      const yOffset = -80;
      const y =
        sectionElement.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    // Close mobile menu after clicking
    setIsMobileMenuOpen(false);
  };

  // Handle scroll event to update active section
  useEffect(() => {
    const handleScroll = () => {
      // Show/hide scroll to top button
      if (window.scrollY > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }

      // Update active section based on scroll position
      const sectionIds = sections.map((section) => section.id);
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const sectionId = sectionIds[i];
        const sectionElement = sectionRefs.current[sectionId];
        if (sectionElement) {
          const rect = sectionElement.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background w-full flex flex-col items-center">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border shadow-sm w-full">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="h-6 w-6" />
            <h1 className="text-xl font-bold">ReSplit Wiki</h1>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeSwitcher />
            <Button variant="outline" size="sm" asChild>
              <Link href="/">Back to App</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8 w-full">
          {/* Sidebar - Desktop */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24 space-y-1">
              {sections.map((section) => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start text-left",
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground",
                  )}
                  onClick={() => scrollToSection(section.id)}
                >
                  {section.title}
                </Button>
              ))}
            </div>
          </aside>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-50 bg-background pt-16">
              <div className="p-4 space-y-2">
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? "default" : "ghost"}
                    className="w-full justify-start text-left"
                    onClick={() => scrollToSection(section.id)}
                  >
                    {section.title}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                ref={(el) => {
                  sectionRefs.current[section.id] = el;
                }}
                className="mb-12"
              >
                <h2 className="text-2xl font-bold mb-4 pb-2 border-b">
                  {section.title}
                </h2>
                <div className="prose prose-sm sm:prose max-w-none dark:prose-invert">
                  {section.content}
                </div>
              </section>
            ))}
          </main>
        </div>
      </div>
      {/* Scroll to top button */}
      {showScrollToTop && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 rounded-full shadow-md z-10"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12 w-full">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>ReSplit App &copy; {new Date().getFullYear()}</p>
          <p>Another product made with 💖 by Wei Hong</p>
        </div>
      </footer>
    </div>
  );
}
