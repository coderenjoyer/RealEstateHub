export function WhyChooseSection() {
  return (
    <section className="py-20 bg-accent/30">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 text-foreground">Why Choose Us?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Over the years we have developed an unparalleled understanding of the real estate market. Our team of
              experienced professionals brings decades of combined expertise, ensuring you receive the best guidance and
              support throughout your property journey.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We pride ourselves on transparency, integrity, and delivering exceptional results. From first-time buyers
              to seasoned investors, we tailor our services to meet your unique needs and exceed your expectations.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <img
                src="/modern-luxury-bedroom.png"
                alt="Luxury bedroom"
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            <div>
              <img
                src="/modern-office-interior.png"
                alt="Office space"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            <div>
              <img
                src="/luxury-swimming-pool.png"
                alt="Swimming pool"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
