# Toolflow Metrics Atlas

Zagregowane dane:

* Wykres słupkowy ilość wywołań narzędzi ogólnie.
* Najczęstsze sekwencje wywołań narzędzi, czyli kolejne tool calle w jednym requeście (np. search → sql → answer). Top N sekwencji z liczbą wystąpień i udziałem procentowym. (Czy to ma sens bo przy 4 toolach mamy 4^10 sekwencji)
* Może lepiej najczęstsze pary narzędzi wywoływanych bezpośrednio po sobie (A → B), jako ranking lub macierz przejść.
* Narzędzia wywoływane razem, żeby pokazać które najczęściej model wywołuje razem.
* Rozkład narzędzi w poszczególnych iteracjach czyli liczba wywołań każdego narzędzia per numer iteracji (wykres słupkowy skumulowany: oś X to iteracja, a serie to narzędzia).
* tool_errors i jako liczba (trend w czasie).
* hitami iterations procentowy trend w czasie 
* Średni czas działania rag i ttft Dodatkowo min i max (trend w czasie).
* Zużycie tokenów całościowe (input/output).

Wykresy porównawcze: domeny

Każdy wykres ma przełącznik grupowania: domain.

* Średnia liczba iteracji.
*zużycie tokenów 
* Średnia liczba tool calli na request.
* Średnia liczba LLM calli na request.

Wykresy porównujące narzędzia

* Średni czas działania narzędzi (trend w czasie) filtrowanie po narzędziu. Dodatkowo min i max.
* Token usage per narzędzie. Liczba tokenów, które narzędzie generuje lub zużywa (argumenty wywołania i wynik wstrzykiwany do kontekstu). Pokazuje średnią i sumę.
* Liczba iteracji, jeśli obowiązuje. Dotyczy narzędzi działających iteracyjnie (np. agentic SQL/metadata). Pokazuje średnią liczbę iteracji na wywołanie narzędzia albo numer iteracji, w której narzędzie najczęściej się pojawia. Dla narzędzi jednokrokowych wykres pomija je lub oznacza „n/a”.
* Liczba błędów (num errors). Liczba i odsetek wywołań zakończonych błędem per narzędzie (tool_errors). 


stwórz dashboard w którym po prostu przedstawisz te wszystkie dashboardy tak żebym mogła zobaczyć jak to wygląda i ewenutalnie bedziemy wprowadzac zmiany, wszystko po angielsku

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5127242b-efb7-4110-88bd-81684190d845).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
