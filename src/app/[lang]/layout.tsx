import type { Metadata } from "next";
import { getTextDirection } from "@/lib/rtl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  
  // Translate metadata based on language
  const getMetadata = (language: string) => {
    switch (language) {
      case 'ar':
        return {
          title: "جالاتايد أوشن - أسرار المحيط",
          description: "اكتشف أسرار أعماق المحيط مع جالاتايد. مقالات علمية وأبحاث حول الحياة البحرية والاكتشافات المحيطية.",
          keywords: "المحيط، الحياة البحرية، الأبحاث المحيطية، علوم البحار، اكتشافات بحرية، جالاتايد",
        };
      case 'fr':
        return {
          title: "Galatide Océan - Mystères de l'Océan",
          description: "Découvrez les mystères des profondeurs océaniques avec Galatide. Articles scientifiques et recherches sur la vie marine et les découvertes océaniques.",
          keywords: "océan, vie marine, recherche océanique, sciences marines, découvertes marines, galatide",
        };
      case 'de':
        return {
          title: "Galatide Ozean - Geheimnisse des Ozeans",
          description: "Entdecken Sie die Geheimnisse der Meerestiefen mit Galatide. Wissenschaftliche Artikel und Forschung über Meeresleben und ozeanische Entdeckungen.",
          keywords: "ozean, meeresleben, meeresforschung, meereswissenschaften, meeresentdeckungen, galatide",
        };
      case 'ru':
        return {
          title: "Галатайд Океан - Тайны Океана",
          description: "Откройте тайны океанских глубин с Галатайд. Научные статьи и исследования морской жизни и океанических открытий.",
          keywords: "океан, морская жизнь, океанические исследования, морские науки, морские открытия, галатайд",
        };
      case 'zh':
        return {
          title: "加拉泰德海洋 - 海洋奥秘",
          description: "与加拉泰德一起探索海洋深处的奥秘。关于海洋生物和海洋发现的科学文章和研究。",
          keywords: "海洋, 海洋生物, 海洋研究, 海洋科学, 海洋发现, 加拉泰德",
        };
      case 'hi':
        return {
          title: "गैलाटाइड महासागर - समुद्री रहस्य",
          description: "गैलाटाइड के साथ समुद्री गहराई के रहस्यों की खोज करें। समुद्री जीवन और समुद्री खोजों पर वैज्ञानिक लेख और अनुसंधान।",
          keywords: "महासागर, समुद्री जीवन, समुद्री अनुसंधान, समुद्री विज्ञान, समुद्री खोजें, गैलाटाइड",
        };
      default: // English
        return {
          title: "Galatide Ocean - Ocean Mysteries",
          description: "Discover the mysteries of ocean depths with Galatide. Scientific articles and research about marine life and oceanic discoveries.",
          keywords: "ocean, marine life, oceanic research, marine science, marine discoveries, galatide",
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

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ lang: string }> }>) {
  const resolvedParams = await params;
  const dir = getTextDirection(resolvedParams.lang);
  
  return (
    <div lang={resolvedParams.lang} dir={dir} className="locale-wrapper">
      {children}
    </div>
  );
}


