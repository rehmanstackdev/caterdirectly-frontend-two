import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { getCustomerFaqs } from "@/content/faqs";

const FaqSection = () => {
  // Limit to top 5 most important FAQs in the UI
  const faqs = getCustomerFaqs().slice(0, 5);

  return (
    <section id="faqs" aria-labelledby="faqs-heading" className="max-w-[1800px] mx-auto w-full px-4 md:px-6 py-12 md:py-16 lg:py-20">
      <div className="mt-8 md:mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-start">
        <div className="lg:col-span-5 lg:self-center">
          <header className="max-w-3xl">
            <p className="text-sm font-semibold tracking-wide">FAQ</p>
            <h2 id="faqs-heading" className="text-3xl md:text-4xl font-bold mt-2">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-base md:text-lg opacity-80">
              Answers to common questions about venues, vendors, and planning in Northern California. More locations coming soon.
            </p>
          </header>
        </div>
        <div className="lg:col-span-7">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="border-none group">
                {/* Wrapper ensures both question and answer sit inside one rounded card when open */}
                <div className="transition-all group-data-[state=open]:rounded-xl group-data-[state=open]:border group-data-[state=open]:shadow-sm group-data-[state=open]:bg-background">
                  <AccordionTrigger className="group text-left hover:no-underline [&>svg]:hidden px-5 py-5">
                    <span className="pr-4">{faq.question}</span>
                    <span className="ml-auto text-2xl leading-none group-data-[state=open]:hidden select-none" aria-hidden="true">+</span>
                    <span className="ml-auto text-2xl leading-none hidden group-data-[state=open]:inline select-none" aria-hidden="true">−</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5">
                    <p>{faq.answer}</p>
                  </AccordionContent>
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

    </section>
  );
};

export default FaqSection;
