import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  
  // Translate articles page metadata based on language
  const getMetadata = (language: string) => {
    switch (language) {
      case 'ar':
        return {
          title: "المقالات - جالاتايد أوشن",
          description: "تصفح مجموعتنا من المقالات العلمية حول أسرار المحيط والحياة البحرية. اكتشف أحدث الأبحاث والاكتشافات المحيطية.",
          keywords: "مقالات المحيط، الأبحاث البحرية، علوم المحيط، الحياة البحرية، اكتشافات بحرية",
        };
      case 'fr':
        return {
          title: "Articles - Galatide Océan",
          description: "Parcourez notre collection d'articles scientifiques sur les mystères de l'océan et la vie marine. Découvrez les dernières recherches et découvertes océaniques.",
          keywords: "articles océan, recherche marine, sciences océaniques, vie marine, découvertes marines",
        };
      case 'de':
        return {
          title: "Artikel - Galatide Ozean",
          description: "Durchstöbern Sie unsere Sammlung wissenschaftlicher Artikel über Meeresgeheimnisse und Meeresleben. Entdecken Sie die neuesten Forschungen und ozeanischen Entdeckungen.",
          keywords: "ozean artikel, meeresforschung, ozeanwissenschaften, meeresleben, meeresentdeckungen",
        };
      case 'ru':
        return {
          title: "Статьи - Галатайд Океан",
          description: "Просмотрите нашу коллекцию научных статей о тайнах океана и морской жизни. Откройте для себя последние исследования и океанические открытия.",
          keywords: "статьи об океане, морские исследования, океанические науки, морская жизнь, морские открытия",
        };
      case 'zh':
        return {
          title: "文章 - 加拉泰德海洋",
          description: "浏览我们关于海洋奥秘和海洋生物的科学文章集合。发现最新的研究和海洋发现。",
          keywords: "海洋文章, 海洋研究, 海洋科学, 海洋生物, 海洋发现",
        };
      case 'hi':
        return {
          title: "लेख - गैलाटाइड महासागर",
          description: "समुद्री रहस्यों और समुद्री जीवन पर हमारे वैज्ञानिक लेखों के संग्रह को देखें। नवीनतम अनुसंधान और समुद्री खोजों की खोज करें।",
          keywords: "समुद्री लेख, समुद्री अनुसंधान, समुद्री विज्ञान, समुद्री जीवन, समुद्री खोजें",
        };
      default: // English
        return {
          title: "Articles - Galatide Ocean",
          description: "Browse our collection of scientific articles about ocean mysteries and marine life. Discover the latest research and oceanic discoveries.",
          keywords: "ocean articles, marine research, oceanic science, marine life, marine discoveries",
        };
    }
  };

  const metadata = getMetadata(lang);
  
  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      type: "website",
      locale: lang === 'en' ? 'en_US' : 
             lang === 'ar' ? 'ar_SA' :
             lang === 'fr' ? 'fr_FR' :
             lang === 'de' ? 'de_DE' :
             lang === 'ru' ? 'ru_RU' :
             lang === 'zh' ? 'zh_CN' :
             lang === 'hi' ? 'hi_IN' : 'en_US',
    },
    twitter: {
      card: "summary_large_image",
      title: metadata.title,
      description: metadata.description,
    },
  };
}

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}