// German translation of the Privacy policy and the Terms (same sections and ids as the English
// in src/views/Legal.vue). If the two differ, the English version applies.
export const UPDATED = '12. Oktober 2026'

export default ({ mail }) => {
  const TEAM = 'Gabriel Quaye und Nisy Adjei Acheampong'
  return [
    {
      id: 'privacy', tab: 'Datenschutzerklärung', title: 'Datenschutzerklärung',
      summary: [
        'Wir verkaufen Ihre Daten nie und zeigen Ihnen keine Werbung.',
        'Ihr Lebenslauf gehört Ihnen. Löschen Sie ihn oder Ihr ganzes Konto, wann immer Sie möchten.',
        'Kartendaten gehen direkt an Stripe; wir sehen und speichern sie nie.',
        'Ein Cookie für die Anmeldung. Keine Tracking- oder Werbe-Cookies.',
      ],
      sections: [
        { id: 'who', title: 'Wer wir sind', html: `<p>CVMaster („wir“) ist ein KI-gestützter Lebenslauf-Generator unter cvmaster.live, betrieben in Frankreich von ${TEAM}, die für Ihre personenbezogenen Daten verantwortlich sind („Verantwortliche“). Kontakt: ${mail}.</p>` },
        { id: 'collect', title: 'Welche Daten wir erheben', html: `<ul>
          <li><strong>Kontodaten</strong>: Ihr Name, Ihre E-Mail-Adresse und Ihr Passwort (nur als sicherer Hash gespeichert).</li>
          <li><strong>Ihre Lebensläufe</strong>: alles, was Sie eintragen. Ohne Konto bleibt Ihr Lebenslauf nur in Ihrem Browser, bis Sie sich registrieren.</li>
          <li><strong>Stellenanzeigen</strong>: Texte, die Sie einfügen, um einen Lebenslauf anzupassen, gespeichert mit diesem Lebenslauf.</li>
          <li><strong>Zahlungen</strong>: werden von Stripe abgewickelt. Wir speichern, dass ein Lebenslauf bezahlt wurde, nie Ihre Kartendaten.</li>
          <li><strong>Nachrichten an uns</strong>: Feedback und Beschwerden, mit der E-Mail-Adresse, die Sie für unsere Antwort angeben.</li>
          <li><strong>Technische Daten</strong>: einfache Server-Logs (IP-Adresse, Uhrzeit) für die Sicherheit und zur Fehlerbehebung.</li>
        </ul>` },
        { id: 'use', title: 'Wofür wir sie verwenden', html: `<ul>
          <li>Um Ihr Konto zu führen und Ihre Lebensläufe zu speichern.</li>
          <li>Für die KI-Funktionen, die Sie nutzen (Schreibhilfe, Anpassung an eine Stelle, ATS-Prüfung, Passungsprüfung, Übersetzung).</li>
          <li>Um KI-Vorschläge für Lebensläufe auf Ihren eigenen Namen zu personalisieren, mit Ihren Antworten bei der Registrierung und Ihren anderen Lebensläufen. Lebensläufe, die Sie für andere erstellen, nutzen diese Angaben nicht, und Sie können das in den Einstellungen abschalten.</li>
          <li>Um Ihnen Ihren Lebenslauf und Kontonachrichten wie das Zurücksetzen des Passworts per E-Mail zu senden.</li>
          <li>Um Zahlungen über Stripe abzuwickeln.</li>
          <li>Um auf Ihr Feedback und Ihre Beschwerden zu antworten und CVMaster zu verbessern.</li>
        </ul>` },
        { id: 'personal', title: 'Personalisierung, Benachrichtigungen und Sprache', html: `<p><strong>Ihr Land</strong>: Website und App erfassen, auf welches Land Ihr Gerät eingestellt ist, anhand seiner Zeitzone (nie anhand Ihrer Internetadresse). Wir nutzen das, um Preise in Ihrer Währung anzuzeigen und zu zählen, wie viele Menschen CVMaster in jedem Land nutzen, mit oder ohne Konto.</p><p>Wenn Sie angemeldet sind, speichern wir eine kurze Übersicht darüber, was Sie in CVMaster tun, auf der Website und in der App: zum Beispiel, dass Sie einen Lebenslauf erstellt, ein Layout gewählt, eine KI-Funktion genutzt, einen Lebenslauf mit einer Stelle abgeglichen oder exportiert haben. Wir nutzen sie nur, um CVMaster für Sie zu personalisieren: um Ihnen den nächsten Schritt vorzuschlagen, die Layouts, die Ihnen gefallen, zuerst zu zeigen und Sie höchstens einmal pro Woche daran zu erinnern, wo Sie aufgehört haben. Die Daten bleiben auf unseren eigenen Servern, werden nie verkauft oder weitergegeben und nie für Werbung genutzt. Sie werden nach 13 Monaten gelöscht, und mit Ihrem Konto.</p><p>Sie können dies jederzeit in den Einstellungen ausschalten („Mit meiner Aktivität personalisieren“); was wir gespeichert hatten, wird dann gelöscht. Wir stützen uns auf unser berechtigtes Interesse, CVMaster für Sie nützlich zu machen, und Ihr Widerspruchsrecht gilt immer.</p><p><strong>Push-Benachrichtigungen</strong> (Handy-App): Wenn Sie sie erlauben, senden wir Benachrichtigungen, etwa über einen kostenlosen Lebenslauf dank Ihres Einladungslinks, und die oben genannten Erinnerungen. Dafür speichern wir eine Benachrichtigungskennung Ihres Telefons; die Benachrichtigungen werden über Expo, Apple und Google zugestellt. Schalten Sie sie in den Einstellungen der App oder Ihres Telefons aus.</p><p><strong>Spracheingabe</strong> (Handy-App): Wenn Sie Ihre Geschichte aufnehmen, wird die Aufnahme an einen Transkriptionsdienst gesendet, um sie in Text umzuwandeln. Wir speichern die Aufnahme nicht.</p>` },
        { id: 'newsletter', title: 'Newsletter', html: `<p>Unseren Newsletter (Tipps für Ihren Lebenslauf und Neuigkeiten zu CVMaster) senden wir nur, wenn Sie ihn anfordern: auf der Startseite, über das optionale Kästchen bei der Kontoerstellung oder in den Einstellungen. Wenn Sie sich auf der Startseite eintragen, senden wir Ihnen zuerst einen Bestätigungslink. Rechtsgrundlage ist Ihre Einwilligung.</p><p>Wir speichern Ihre E-Mail-Adresse, wann und wo Sie eingewilligt haben und wann Sie sich abgemeldet haben. Jeder Newsletter enthält einen Link zur Abmeldung mit einem Klick; Sie können ihn auch in den Einstellungen abschalten oder an ${mail} schreiben. Wir stellen den Versand sofort ein. E-Mails zu Ihrem Konto und Ihren Käufen sind davon nicht betroffen.</p>` },
        { id: 'share', title: 'An wen wir Daten weitergeben', html: `<p>Wir verkaufen Ihre Daten nicht. Wir geben sie nur an die Dienste weiter, die CVMaster ermöglichen:</p><ul>
          <li><strong>KI-Dienstleister</strong>: Der Text des Lebenslaufs und eine eventuelle Stellenanzeige werden für das Ergebnis einer KI-Funktion an sie übermittelt.</li>
          <li><strong>Stripe</strong>: Zahlungen.</li>
          <li><strong>Resend</strong>: E-Mail-Versand, einschließlich der PDF-Lebensläufe, die Sie exportieren.</li>
          <li><strong>Google</strong>: nur wenn Sie sich mit Google anmelden.</li>
          <li><strong>Vercel, Render und Neon</strong>: Hosting und die Datenbank, in der Ihre Daten gespeichert sind.</li>
        </ul><p>Einige dieser Anbieter haben ihren Sitz in den USA oder verarbeiten Daten dort. Verlassen Daten die EU, sind sie durch die von der DSGVO verlangten Garantien geschützt, etwa die Standardvertragsklauseln der Europäischen Kommission oder das EU–US Data Privacy Framework.</p>` },
        { id: 'keep', title: 'Wie lange wir sie speichern', html: `<p>Wir speichern Ihr Konto und Ihre Lebensläufe, bis Sie sie löschen oder uns darum bitten. Feedback und Beschwerden bewahren wir so lange auf, wie wir sie zur Bearbeitung brauchen. Zahlungsbelege können länger aufbewahrt werden, wenn das Gesetz es verlangt.</p>` },
        { id: 'rights', title: 'Ihre Rechte', html: `<p>Nach dem Datenschutzrecht des Vereinigten Königreichs und der EU können Sie Auskunft über Ihre personenbezogenen Daten verlangen, sie berichtigen, exportieren oder löschen lassen oder der Verwendung widersprechen. Schreiben Sie an ${mail}; wir antworten innerhalb eines Monats.</p><p>Wenn Sie mit unserem Umgang mit Ihren Daten nicht zufrieden sind, können Sie sich bei der CNIL (cnil.fr), der französischen Datenschutzbehörde, oder bei der Aufsichtsbehörde Ihres Landes beschweren, in Deutschland etwa bei der Datenschutzbehörde Ihres Bundeslandes.</p>` },
        { id: 'cookies', title: 'Cookies', html: `<p>Wir verwenden ein Cookie, damit Sie angemeldet bleiben. Wir verwenden keine Tracking- oder Werbe-Cookies. Der lokale Speicher Ihres Browsers enthält Ihren Lebenslauf, wenn Sie CVMaster ohne Konto nutzen, sowie Ihre Einstellungen (Sprache, dunkler Modus).</p>` },
        { id: 'security', title: 'Sicherheit', html: `<p>Passwörter werden mit bcrypt gehasht, alles wird über HTTPS übertragen, und Kartenzahlungen wickelt vollständig Stripe ab.</p>` },
        { id: 'changes', title: 'Änderungen dieser Erklärung', html: `<p>Wenn wir diese Erklärung ändern, aktualisieren wir das Datum oben und informieren Sie bei wesentlichen Änderungen per E-Mail.</p>` },
      ],
    },
    {
      id: 'terms', tab: 'Nutzungsbedingungen', title: 'Nutzungsbedingungen',
      summary: [
        'Erstellen und Vorschau Ihres Lebenslaufs sind kostenlos.',
        'Ein PDF ohne Wasserzeichen kostet 0,99 € pro Lebenslauf, einmalig, ohne Abo.',
        'Was Sie schreiben, gehört Ihnen. Prüfen Sie KI-Vorschläge, bevor Sie Ihren Lebenslauf versenden.',
        'Etwas schiefgelaufen? Sagen Sie es uns. Ist Ihr Lebenslauf nie angekommen, senden wir ihn erneut oder erstatten den Betrag.',
      ],
      sections: [
        { id: 'accept', title: 'Nutzung von CVMaster', html: `<p>Mit der Nutzung von CVMaster stimmen Sie diesen Bedingungen zu. Wenn Sie nicht einverstanden sind, nutzen Sie den Dienst bitte nicht. Sie müssen mindestens 16 Jahre alt sein.</p>` },
        { id: 'service', title: 'Der Dienst', html: `<p>Mit CVMaster können Sie Lebensläufe erstellen, bearbeiten, anpassen und exportieren, auf Wunsch mit KI-Unterstützung. Wir arbeiten daran, dass alles zuverlässig läuft, der Dienst wird jedoch „wie besehen“ bereitgestellt und ist möglicherweise zeitweise nicht verfügbar.</p>` },
        { id: 'account', title: 'Ihr Konto', html: `<ul>
          <li>Machen Sie bei der Registrierung korrekte Angaben.</li>
          <li>Halten Sie Ihr Passwort geheim. Sie sind für die Aktivitäten in Ihrem Konto verantwortlich.</li>
        </ul>` },
        { id: 'payments', title: 'Zahlungen', html: `<ul>
          <li>Das PDF ohne Wasserzeichen eines Lebenslaufs kostet einmalig <strong>0,99 €</strong>. Darin enthalten sind der Versand per E-Mail, der direkte Download sowie unbegrenztes erneutes Senden und Herunterladen desselben Lebenslaufs, auch nach Änderungen.</li>
          <li>Ein Vorschau-PDF mit Wasserzeichen ist kostenlos.</li>
          <li>Die KI-Funktionen umfassen <strong>30 kostenlose Anfragen pro Tag</strong> für Konten mit bestätigter E-Mail-Adresse (Gäste und unbestätigte Konten erhalten 5), die täglich um Mitternacht (UTC) zurückgesetzt werden. Ein Paket mit <strong>100 zusätzlichen Anfragen</strong> kostet <strong>0,50 €</strong>; zusätzliche Anfragen verfallen nicht, werden erst nach den kostenlosen Anfragen des Tages verwendet und haben keinen Geldwert.</li>
          <li>Empfehlungen: Wer sich über Ihren Einladungslink registriert, erhält 25 zusätzliche KI-Anfragen. Kauft diese Person ihr erstes PDF ohne Wasserzeichen, erhalten Sie ein Empfehlungsguthaben, das das PDF ohne Wasserzeichen eines Lebenslaufs freischaltet. Guthaben haben keinen Geldwert.</li>
          <li>Zahlungen werden von Stripe abgewickelt.</li>
          <li><strong>Widerrufsrecht:</strong> Normalerweise können Sie einen Online-Kauf innerhalb von 14 Tagen widerrufen. Da Ihr PDF (oder Ihre KI-Anfragen) sofort geliefert werden, verlangen Sie beim Bezahlen ausdrücklich den sofortigen Beginn und bestätigen, dass Sie dieses Recht mit der Lieferung verlieren, wie es das EU-Verbraucherrecht erlaubt (in Frankreich Artikel L221-28 des Code de la consommation).</li>
          <li>Ist Ihr Lebenslauf nie angekommen oder ist bei einer Zahlung etwas schiefgelaufen, melden Sie sich innerhalb von 14 Tagen; wir senden ihn erneut oder erstatten den Betrag.</li>
        </ul>` },
        { id: 'complaints', title: 'Beschwerden', html: `<p>Wenn Sie mit etwas unzufrieden sind, sei es der Dienst, eine Zahlung oder unser Umgang mit Ihnen, sagen Sie es uns bitte:</p><ul>
          <li>Nutzen Sie <strong>Feedback → Beschwerde</strong> (in der Seitenleiste, in den Einstellungen oder unten auf dieser Seite) oder schreiben Sie an ${mail}.</li>
          <li>Geben Sie an, was passiert ist, wann, und die E-Mail-Adresse Ihres Kontos oder Ihrer Zahlung.</li>
          <li>Sie erhalten eine Referenznummer. Wir antworten möglichst innerhalb von 5 Werktagen und lösen Beschwerden möglichst innerhalb von 14 Tagen.</li>
        </ul>` },
        { id: 'use', title: 'Zulässige Nutzung', html: `<p>Bitte</p><ul>
          <li>nutzen Sie CVMaster nicht für rechtswidrige oder irreführende Zwecke;</li>
          <li>umgehen Sie keine Zahlungen und nutzen Sie keine kostenpflichtigen Funktionen, ohne zu bezahlen;</li>
          <li>kopieren, analysieren (Reverse Engineering) oder verkaufen Sie den Dienst oder seine Vorlagen nicht weiter;</li>
          <li>laden Sie keine Inhalte hoch, die rechtswidrig oder schädlich sind oder die Rechte anderer verletzen.</li>
        </ul>` },
        { id: 'reviews', title: 'Bewertungen', html: `<p>Wer einen Lebenslauf erstellt hat, kann CVMaster bewerten. Sternebewertungen zählen sofort. Schriftliche Kommentare und spätere Änderungen daran prüfen wir, bevor sie auf unserer Website erscheinen, um Spam, Beleidigungen und persönliche Daten fernzuhalten; bis eine Änderung freigegeben ist, bleibt die vorherige Fassung sichtbar. Wir entfernen oder verbergen niemals eine Bewertung, weil sie negativ ist, und wir bezahlen nicht für Bewertungen.</p>` },
        { id: 'ai', title: 'KI-generierte Inhalte', html: `<p>KI-Vorschläge können falsch sein. CVMaster fügt nie etwas ohne Ihre Zustimmung hinzu, Sie sind aber dafür verantwortlich, vor dem Versand zu prüfen, dass alles in Ihrem Lebenslauf stimmt.</p>` },
        { id: 'ip', title: 'Wem was gehört', html: `<p>Der Inhalt Ihres Lebenslaufs gehört Ihnen. Die Plattform CVMaster, ihre Designs und Vorlagen gehören uns.</p>` },
        { id: 'liability', title: 'Haftung', html: `<p>Wir haften nicht für indirekte Schäden oder Folgeschäden, einschließlich des Ergebnisses einer Bewerbung. Nichts in diesen Bedingungen schränkt Ihre Rechte nach dem Verbraucherrecht ein.</p>` },
        { id: 'law', title: 'Anwendbares Recht', html: `<p>Für diese Bedingungen gilt französisches Recht. Als Verbraucher behalten Sie zusätzlich den Schutz der zwingenden Verbraucherschutzgesetze Ihres Wohnsitzlandes und können vor den Gerichten Ihres Landes klagen.</p>` },
        { id: 'notice', title: 'Impressum', html: `<ul>
          <li><strong>Herausgeber:</strong> ${TEAM}, Frankreich, ${mail}</li>
          <li><strong>Hosting der Website:</strong> Vercel Inc. (vercel.com)</li>
          <li><strong>Hosting der Anwendung:</strong> Render Services, Inc. (render.com)</li>
          <li><strong>Datenbank:</strong> Neon (neon.tech)</li>
        </ul>` },
      ],
    },
  ]
}
