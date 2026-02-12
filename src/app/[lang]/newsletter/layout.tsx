import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  // Translate newsletter page metadata based on language
  const getMetadata = (language: string) => {
    switch (language) {
      case 'ar':
        return {
          title: "النشرة الإخبارية - جالاتايد أوشن",
          description: "اشترك في نشرتنا الإخبارية لتحصل على أحدث المقالات والاكتشافات المحيطية. كن أول من يعرف عن أسرار المحيط الجديدة.",
          keywords: "النشرة الإخبارية، اشتراك، أخبار المحيط، مقالات بحرية، اكتشافات محيطية",
        };
      case 'fr':
        return {
          title: "Newsletter - Galatide Océan",
          description: "Abonnez-vous à notre newsletter pour recevoir les derniers articles et découvertes océaniques. Soyez le premier à connaître les nouveaux mystères de l'océan.",
          keywords: "newsletter, abonnement, nouvelles océan, articles marins, découvertes océaniques",
        };
      case 'de':
        return {
          title: "Newsletter - Galatide Ozean",
          description: "Abonnieren Sie unseren Newsletter, um die neuesten Artikel und ozeanischen Entdeckungen zu erhalten. Seien Sie der Erste, der von neuen Meeresgeheimnissen erfährt.",
          keywords: "newsletter, abonnement, ozean nachrichten, meeresartikel, ozeanische entdeckungen",
        };
      case 'ru':
        return {
          title: "Рассылка - Галатайд Океан",
          description: "Подпишитесь на нашу рассылку, чтобы получать последние статьи и океанические открытия. Будьте первыми, кто узнает о новых тайнах океана.",
          keywords: "рассылка, подписка, новости океана, морские статьи, океанические открытия",
        };
      case 'zh':
        return {
          title: "通讯 - 加拉泰德海洋",
          description: "订阅我们的通讯，获取最新的文章和海洋发现。成为第一个了解新海洋奥秘的人。",
          keywords: "通讯, 订阅, 海洋新闻, 海洋文章, 海洋发现",
        };
      case 'hi':
        return {
          title: "न्यूज़लेटर - गैलाटाइड महासागर",
          description: "नवीनतम लेख और समुद्री खोजों को प्राप्त करने के लिए हमारे न्यूज़लेटर की सदस्यता लें। नए समुद्री रहस्यों के बारे में जानने वाले पहले व्यक्ति बनें।",
          keywords: "न्यूज़लेटर, सदस्यता, समुद्री समाचार, समुद्री लेख, समुद्री खोजें",
        };
      default: // English
        return {
          title: "Newsletter - Galatide Ocean",
          description: "Subscribe to our newsletter to receive the latest articles and oceanic discoveries. Be the first to know about new ocean mysteries.",
          keywords: "newsletter, subscription, ocean news, marine articles, oceanic discoveries",
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

export default function NewsletterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}