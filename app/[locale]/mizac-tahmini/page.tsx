import type { Metadata } from 'next';
import MizacQuiz from './MizacQuiz';

export const metadata: Metadata = {
  title: '60 saniyelik mizaç tahmini | İpek Yolu Şifacısı',
  description:
    'Dört soruda baskın mizacınızın bir tahmini; klasik tıp eksenine göre. Tam analiz için ön kapı.',
};

export default function Page() {
  return <MizacQuiz />;
}
