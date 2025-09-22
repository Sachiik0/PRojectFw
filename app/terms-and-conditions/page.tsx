'use client';

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-8 space-y-6">
        <h1 className="text-2xl font-bold">📜 Terms & Conditions</h1>

        <p className="text-gray-700">
          By signing up and using our Freedom Wall, you agree to the following rules and
          guidelines. Please read this carefully bago ka magpatuloy. 💡
        </p>

        <section>
          <h2 className="text-lg font-semibold">1. Respect Others</h2>
          <p className="text-gray-600">
            Walang hate speech, bullying, harassment, o kahit anong offensive content.
            Keep it fun and safe para sa lahat.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. Freedom with Responsibility</h2>
          <p className="text-gray-600">
            Pwede kang mag-post anonymously or gamit ang pen name mo, pero wag gamitin ang
            wall para sa illegal, spammy, or harmful na activities.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. Content Ownership</h2>
          <p className="text-gray-600">
            Ikaw ang may-ari ng posts na gagawin mo, pero by posting, you allow us to
            display them publicly sa Freedom Wall app. ✨
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Privacy</h2>
          <p className="text-gray-600">
            Hindi namin ibebenta ang email mo or personal info. Used lang siya para
            ma-manage ang account mo at security ng platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. Rule Violations</h2>
          <p className="text-gray-600">
            Kapag may nag-violate ng rules, pwedeng i-delete ang post or i-ban ang user.
            Simple lang: respect para tuloy-tuloy ang saya. 🎉
          </p>
        </section>

        <p className="text-gray-500 text-sm italic">
          By clicking “I agree” during signup, tanggap mo ang terms na ito. Kung di ka
          agree, wag ka muna mag-register. 💙
        </p>
      </div>
    </div>
  );
}
