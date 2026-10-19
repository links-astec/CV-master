// Italian translation of the Privacy policy and the Terms (same sections and ids as the English
// in src/views/Legal.vue). If the two differ, the English version applies.
export const UPDATED = '12 ottobre 2026'

export default ({ mail }) => {
  const TEAM = 'Gabriel Quaye e Nisy Adjei Acheampong'
  return [
    {
      id: 'privacy', tab: 'Informativa sulla privacy', title: 'Informativa sulla privacy',
      summary: [
        'Non vendiamo mai i tuoi dati e non ti mostriamo pubblicità.',
        'Il tuo CV è tuo. Eliminalo, o elimina l’intero account, quando vuoi.',
        'I dati della carta vanno direttamente a Stripe; non li vediamo né li conserviamo mai.',
        'Un solo cookie per l’accesso. Nessun cookie di tracciamento o pubblicitario.',
      ],
      sections: [
        { id: 'who', title: 'Chi siamo', html: `<p>CVMaster («noi») è un generatore di CV assistito dall’IA, disponibile su cvmaster.live e gestito in Francia da ${TEAM}, titolari del trattamento dei tuoi dati personali. Contatto: ${mail}.</p>` },
        { id: 'collect', title: 'Quali dati raccogliamo', html: `<ul>
          <li><strong>Dati dell’account</strong>: nome, indirizzo email e password (conservata solo come hash sicuro).</li>
          <li><strong>I tuoi CV</strong>: tutto ciò che vi inserisci. Senza account, il CV resta solo nel tuo browser finché non ti registri.</li>
          <li><strong>Offerte di lavoro</strong>: le descrizioni che incolli per adattare un CV, salvate con quel CV.</li>
          <li><strong>Pagamenti</strong>: gestiti da Stripe. Registriamo che un CV è stato pagato, mai i dati della tua carta.</li>
          <li><strong>Messaggi che ci invii</strong>: feedback e reclami, con l’email che ci indichi per la risposta.</li>
          <li><strong>Dati tecnici</strong>: log di base del server (indirizzo IP, orario) per la sicurezza e la risoluzione dei problemi.</li>
        </ul>` },
        { id: 'use', title: 'Come li usiamo', html: `<ul>
          <li>Per gestire il tuo account e salvare i tuoi CV.</li>
          <li>Per le funzioni di IA che scegli di usare (aiuto nella scrittura, adattamento a un’offerta, controllo ATS, verifica dell’idoneità al ruolo, traduzione).</li>
          <li>Per personalizzare i suggerimenti dell’IA sui CV a tuo nome, usando le risposte date all’iscrizione e gli altri tuoi CV. I CV che crei per altre persone non li usano, e puoi disattivare questa funzione nelle Impostazioni.</li>
          <li>Per inviarti via email il tuo CV e i messaggi relativi all’account, come il ripristino della password.</li>
          <li>Per ricevere i pagamenti tramite Stripe.</li>
          <li>Per rispondere a feedback e reclami e per migliorare CVMaster.</li>
        </ul>` },
        { id: 'personal', title: 'Personalizzazione, notifiche e voce', html: `<p><strong>Il tuo paese</strong>: il sito e l’app registrano il paese impostato sul tuo dispositivo, in base al fuso orario (mai in base al tuo indirizzo internet). Lo usiamo per mostrare i prezzi nella tua valuta e per contare quante persone usano CVMaster in ogni paese, con o senza account.</p><p>Quando hai effettuato l’accesso, conserviamo una breve traccia di ciò che fai in CVMaster, sul sito e nell’app: per esempio che hai creato un CV, scelto un layout, usato una funzione di IA, confrontato un CV con un’offerta o lo hai esportato. La usiamo solo per personalizzare CVMaster per te: suggerirti il passo successivo, mostrarti prima i layout che preferisci e ricordarti, al massimo una volta a settimana, dove eri rimasto. Resta sui nostri server, non viene mai venduta né condivisa e non viene mai usata per la pubblicità. Viene cancellata dopo 13 mesi, e insieme al tuo account.</p><p>Puoi disattivarla in qualsiasi momento nelle Impostazioni («Personalizza con la mia attività»); quanto conservato viene allora cancellato. Ci basiamo sul nostro legittimo interesse a rendere CVMaster utile per te, e il tuo diritto di opposizione si applica sempre.</p><p><strong>Notifiche push</strong> (app per telefono): se le consenti, inviamo notifiche, per esempio un CV gratuito ottenuto con il tuo link di invito, e i promemoria qui sopra. Per questo conserviamo un identificativo di notifica del tuo telefono; le notifiche vengono consegnate tramite Expo, Apple e Google. Disattivale nelle Impostazioni dell’app o del telefono.</p><p><strong>Input vocale</strong> (app per telefono): se registri la tua storia, la registrazione viene inviata a un servizio di trascrizione per trasformarla in testo. Non conserviamo la registrazione.</p>` },
        { id: 'newsletter', title: 'Newsletter', html: `<p>Ti inviamo la newsletter (consigli per il CV e novità di CVMaster) solo se la richiedi: dalla home page, con la casella facoltativa quando crei l’account, o nelle Impostazioni. Se ti iscrivi dalla home page, ti inviamo prima un link di conferma. La base giuridica è il tuo consenso.</p><p>Conserviamo il tuo indirizzo email, quando e dove hai dato il consenso e quando ti sei disiscritto. Ogni newsletter contiene un link per disiscriverti con un clic; puoi anche disattivarla nelle Impostazioni o scrivere a ${mail}. Smettiamo subito di inviarla. Le email relative al tuo account e ai tuoi acquisti non sono interessate.</p>` },
        { id: 'share', title: 'Con chi li condividiamo', html: `<p>Non vendiamo i tuoi dati. Li condividiamo solo con i servizi che fanno funzionare CVMaster:</p><ul>
          <li><strong>Fornitori di servizi di IA</strong>: Il testo del CV e l’eventuale offerta di lavoro coinvolti in una funzione di IA vengono inviati loro per ottenere il risultato.</li>
          <li><strong>Stripe</strong>: pagamenti.</li>
          <li><strong>Resend</strong>: invio delle email, compresi i PDF dei CV che esporti.</li>
          <li><strong>Google</strong>: solo se accedi con Google.</li>
          <li><strong>Vercel, Render e Neon</strong>: hosting e database in cui sono conservati i tuoi dati.</li>
        </ul><p>Alcuni di questi fornitori hanno sede negli Stati Uniti o vi trattano dati. Quando i dati lasciano l’UE, sono protetti dalle garanzie richieste dal GDPR, come le clausole contrattuali tipo della Commissione europea o il Data Privacy Framework UE–USA.</p>` },
        { id: 'keep', title: 'Per quanto tempo li conserviamo', html: `<p>Conserviamo il tuo account e i tuoi CV finché non li elimini o non ci chiedi di farlo. Feedback e reclami vengono conservati per il tempo necessario a gestirli. Le registrazioni dei pagamenti possono essere conservate più a lungo quando la legge lo richiede.</p>` },
        { id: 'rights', title: 'I tuoi diritti', html: `<p>In base alla normativa sulla protezione dei dati del Regno Unito e dell’UE puoi chiedere di accedere ai tuoi dati personali, rettificarli, esportarli o cancellarli, oppure opporti al loro utilizzo. Scrivi a ${mail} e ti risponderemo entro un mese.</p><p>Se non sei soddisfatto di come trattiamo i tuoi dati, puoi presentare un reclamo alla CNIL (cnil.fr), l’autorità francese per la protezione dei dati, o all’autorità del paese in cui vivi, per esempio il Garante per la protezione dei dati personali (garanteprivacy.it) in Italia.</p>` },
        { id: 'cookies', title: 'Cookie', html: `<p>Usiamo un cookie per mantenerti connesso. Non usiamo cookie di tracciamento o pubblicitari. La memoria locale del browser conserva il tuo CV se usi CVMaster senza account, e le tue preferenze (lingua, modalità scura).</p>` },
        { id: 'security', title: 'Sicurezza', html: `<p>Le password sono protette con bcrypt, tutto viaggia su HTTPS e i pagamenti con carta sono gestiti interamente da Stripe.</p>` },
        { id: 'changes', title: 'Modifiche a questa informativa', html: `<p>Se modifichiamo questa informativa aggiorneremo la data qui sopra e, in caso di modifiche importanti, te lo comunicheremo via email.</p>` },
      ],
    },
    {
      id: 'terms', tab: 'Termini di servizio', title: 'Termini di servizio',
      summary: [
        'Creare e visualizzare in anteprima il tuo CV è gratis.',
        'Un PDF senza filigrana costa 0,99 € per CV, una sola volta. Oppure il Job Hunt Pass: tutti i tuoi CV a 6,99 € al mese, annulli quando vuoi.',
        'Ciò che scrivi è tuo. Controlla i suggerimenti dell’IA prima di inviare il CV.',
        'Qualcosa non va? Faccelo sapere. Se il tuo CV non è mai arrivato, lo reinviamo o ti rimborsiamo.',
      ],
      sections: [
        { id: 'accept', title: 'Uso di CVMaster', html: `<p>Usando CVMaster accetti questi termini. Se non sei d’accordo, non usare il servizio. Devi avere almeno 16 anni.</p>` },
        { id: 'service', title: 'Il servizio', html: `<p>CVMaster ti permette di creare, modificare, adattare ed esportare CV con l’aiuto facoltativo dell’IA. Ci impegniamo perché funzioni bene, ma il servizio è fornito «così com’è» e a volte potrebbe non essere disponibile.</p>` },
        { id: 'account', title: 'Il tuo account', html: `<ul>
          <li>Fornisci dati corretti al momento della registrazione.</li>
          <li>Tieni al sicuro la tua password. Sei responsabile dell’attività del tuo account.</li>
        </ul>` },
        { id: 'payments', title: 'Pagamenti', html: `<ul>
          <li>Il PDF senza filigrana di un CV è un pagamento unico di <strong>0,99 €</strong>. Comprende l’invio via email, il download diretto e invii e download illimitati dello stesso CV, anche dopo le modifiche.</li>
        <li>Il <strong>Job Hunt Pass</strong> costa <strong>6,99 € al mese</strong> e si rinnova ogni mese finché non lo annulli. Finché è attivo, ogni CV del tuo account può essere inviato via email e scaricato come PDF senza filigrana, e hai 100 richieste di IA al giorno. Puoi annullarlo in qualsiasi momento nelle Impostazioni: non viene addebitato altro e il pass resta attivo fino alla fine del mese già pagato, che non viene rimborsato. Poiché il pass inizia subito su tua richiesta, acquistandolo accetti che il tuo diritto di recesso di 14 giorni termini al suo inizio.</li>
          <li>Il PDF di anteprima con filigrana è gratuito.</li>
          <li>Le funzioni di IA includono <strong>30 richieste gratuite al giorno</strong> per gli account con email confermata (ospiti e account non confermati ne hanno 5), rinnovate ogni giorno a mezzanotte (UTC). Un pacchetto di <strong>100 richieste extra</strong> costa <strong>0,50 €</strong>; le richieste extra non scadono, vengono usate solo dopo quelle gratuite del giorno e non hanno valore in denaro.</li>
          <li>Inviti: chi si registra con il tuo link di invito riceve 25 richieste di IA extra. Quando acquista il suo primo PDF senza filigrana, ottieni un credito invito, che sblocca il PDF senza filigrana di un CV. I crediti non hanno valore in denaro.</li>
          <li>I pagamenti sono elaborati da Stripe.</li>
          <li><strong>Diritto di recesso:</strong> di norma hai 14 giorni per annullare un acquisto online. Poiché il tuo PDF (o le richieste di IA) viene consegnato subito, al pagamento ci chiedi di iniziare immediatamente e confermi di perdere questo diritto una volta avvenuta la consegna, come consentito dalla normativa UE sui consumatori (in Francia, l’articolo L221-28 del Code de la consommation).</li>
          <li>Se il tuo CV non è mai arrivato, o qualcosa è andato storto con un pagamento, contattaci entro 14 giorni e lo reinvieremo o ti rimborseremo.</li>
        </ul>` },
        { id: 'complaints', title: 'Reclami', html: `<p>Se qualcosa non ti soddisfa, che si tratti del servizio, di un pagamento o di come ti abbiamo trattato, diccelo:</p><ul>
          <li>Usa <strong>Feedback → Reclamo</strong> (nella barra laterale, nelle Impostazioni o in fondo a questa pagina), oppure scrivi a ${mail}.</li>
          <li>Indica cosa è successo, quando, e l’email del tuo account o del pagamento.</li>
          <li>Riceverai un numero di riferimento. Cerchiamo di rispondere entro 5 giorni lavorativi e di risolvere i reclami entro 14 giorni.</li>
        </ul>` },
        { id: 'use', title: 'Uso consentito', html: `<p>Ti chiediamo di non:</p><ul>
          <li>usare CVMaster per scopi illeciti o ingannevoli;</li>
          <li>aggirare i pagamenti o accedere alle funzioni a pagamento senza pagare;</li>
          <li>copiare, decompilare o rivendere il servizio o i suoi modelli;</li>
          <li>caricare contenuti illegali, dannosi o che violano i diritti di altri.</li>
        </ul>` },
        { id: 'reviews', title: 'Recensioni', html: `<p>Chi ha creato un CV può valutare CVMaster. Le valutazioni a stelle contano subito. I commenti scritti, e le loro modifiche successive, vengono controllati da noi prima di comparire sul nostro sito, per escludere spam, abusi e dati personali; finché una modifica non è approvata resta la versione precedente. Non rimuoviamo né nascondiamo mai una recensione perché è negativa, e non paghiamo per le recensioni.</p>` },
        { id: 'ai', title: 'Contenuti generati dall’IA', html: `<p>I suggerimenti dell’IA possono essere sbagliati. CVMaster non aggiunge mai nulla senza la tua approvazione, ma sei tu responsabile di verificare che tutto ciò che è nel tuo CV sia vero prima di inviarlo.</p>` },
        { id: 'ip', title: 'Di chi è cosa', html: `<p>Il contenuto del tuo CV è tuo. La piattaforma CVMaster, i suoi design e modelli sono nostri.</p>` },
        { id: 'liability', title: 'Responsabilità', html: `<p>Non siamo responsabili di perdite indirette o consequenziali, compreso l’esito di qualsiasi candidatura. Nulla in questi termini limita i diritti che ti riconosce la normativa sui consumatori.</p>` },
        { id: 'law', title: 'Legge applicabile', html: `<p>Questi termini sono regolati dalla legge francese. Se sei un consumatore, mantieni anche la tutela delle norme imperative a protezione dei consumatori del paese in cui vivi e puoi rivolgerti ai tribunali del tuo paese.</p>` },
        { id: 'notice', title: 'Note legali', html: `<ul>
          <li><strong>Editori:</strong> ${TEAM}, Francia, ${mail}</li>
          <li><strong>Hosting del sito:</strong> Vercel Inc. (vercel.com)</li>
          <li><strong>Hosting dell’applicazione:</strong> Render Services, Inc. (render.com)</li>
          <li><strong>Database:</strong> Neon (neon.tech)</li>
        </ul>` },
      ],
    },
  ]
}
