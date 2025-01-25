-- Insert sample Hadiths
insert into public.hadiths (text, arabic_text, book, narrator, chapter, topics)
values
  (
    'The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended.',
    'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    'Sahih al-Bukhari',
    'Umar ibn Al-Khattab',
    'Book of Revelation',
    ARRAY['intentions', 'deeds', 'rewards']
  ),
  (
    'None of you [truly] believes until he loves for his brother what he loves for himself.',
    'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    'Sahih al-Bukhari',
    'Anas ibn Malik',
    'Book of Faith',
    ARRAY['faith', 'brotherhood', 'love']
  ),
  (
    'The best among you is the one who learns the Quran and teaches it.',
    'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    'Sahih al-Bukhari',
    'Uthman ibn Affan',
    'Book of Virtues of the Quran',
    ARRAY['quran', 'teaching', 'learning']
  ),
  (
    'Whoever believes in Allah and the Last Day should speak good or remain silent.',
    'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    'Sahih al-Bukhari',
    'Abu Hurairah',
    'Book of Good Manners',
    ARRAY['speech', 'silence', 'faith']
  ),
  (
    'The strong person is not the one who can wrestle someone down. The strong person is the one who can control himself when angry.',
    'لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ',
    'Sahih al-Bukhari',
    'Abu Hurairah',
    'Book of Good Manners',
    ARRAY['anger', 'strength', 'self-control']
  );

-- Insert sample quiz for the first Hadith
insert into public.quizzes (hadith_id, questions)
values (
  (select id from public.hadiths where text like '%intentions%' limit 1),
  '[
    {
      "question": "What do deeds depend upon according to the Hadith?",
      "options": ["Intentions", "Actions", "Words", "Thoughts"],
      "correct_answer": "Intentions"
    },
    {
      "question": "Who narrated this Hadith?",
      "options": ["Umar ibn Al-Khattab", "Abu Hurairah", "Anas ibn Malik", "Uthman ibn Affan"],
      "correct_answer": "Umar ibn Al-Khattab"
    }
  ]'::jsonb
); 