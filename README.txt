KOPILICA NAGRADA — verzija 16 (radna verzija)

INSTALACIJA / AŽURIRANJE
1. Raspakujte ZIP.
2. Zamijenite svih 7 datoteka u korijenu GitHub repozitorijuma kopilka-prizov.
3. Kliknite Commit changes i sačekajte GitHub Pages objavu.
4. Na telefonu otvorite aplikaciju i pritisnite „↻ Obновить“.

PROMJENE U V16
- Uklonjen je sistem kodova, njihovog generisanja, prenosa i uvoza.
- Tata ulazi lozinkom na istom telefonu i direktno dodjeljuje tikete.
- Tata na istom telefonu uređuje katalog nagrada i listu školskih predmeta.
- Zahtjevi za potvrdu školskog dana i urađenog domaćeg zadatka čuvaju se lokalno i mogu se potvrđivati kasnije.
- Potvrda školskog dana dodjeljuje 1 tiket i nasumični novčani bonus od 0,20 do 0,70 EUR.
- Potvrda domaćeg zadatka dodjeljuje broj tiketa koji izabere tata i nasumični bonus od 0,20 do 0,70 EUR.
- Nasumična dodjela nagrade pri potvrdi koristi P_i = cost_i^0,15 / sum(cost_j^0,15).
- Dodata je novčana kasica, progresivni ciljevi isplate i prenos ostatka nakon isplate.
- Dnevni tok: pitanje o školi nakon 13:00, izbor predmeta, „Uradio sam“ / „Nisam uspio“, zatim izbor sljedećeg predmeta ili završetak za danas.
- Potvrdni i iskačući dijalozi koje koristi aplikacija prevedeni su na crnogorski.
- Gramatički zadaci prošireni su na 25 po jeziku (engleski, crnogorski i italijanski); tema se prikazuje uz pitanje, a greške ne troše živote.
- Nezavisno miješanje kolona i fiksni položaji kartica iz v15 su sačuvani.
- Keš servisnog radnika ažuriran je na v16-final.

VAŽNO — OTVORENE STAVKE
- Rječnik je proširen na 544 crnogorske, 536 engleskih i 347 italijanskih parova. Sve stavke imaju jedinstvenu riječ na stranom jeziku; prije konačnog puštanja poželjna je dodatna lektura prevoda.
- Nakon 7 isplata po 5 EUR, cilj ostaje 5 EUR dok se ne dogovori naredna faza progresije.
- Nije izvršeno potpuno testiranje na stvarnom Android telefonu. JavaScript i service worker provjereni su sintaksno; broj i jedinstvenost rječničkih stavki provjereni su automatski.

PODACI
Lokalni ključ kopilka-family-v2 sačuvan je. Postojeći tiket-saldo, osvojene nagrade i jezički napredak se čuvaju. Stari kodovi više nijesu dostupni u interfejsu i ne koriste se. Novčana kasica i dnevni zahtjevi čuvaju se lokalno na ovom telefonu. Nema sinhronizacije sa drugim uređajem.

PREPORUKA
Prije ažuriranja napravite rezervnu kopiju u odjeljku „Podaci“.
