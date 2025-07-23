import { getDictionary } from './dictionaries';

type Props = {
  params: Promise<{ lang: string }>
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            {dict.home.title}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {dict.home.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              {dict.home.becomeDonor}
            </button>
            <button className="bg-white hover:bg-gray-50 text-red-600 border-2 border-red-600 px-8 py-3 rounded-lg font-semibold transition-colors">
              {dict.home.viewRequests}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
