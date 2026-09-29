    const resetAll = document.getElementById("resetAll");
    if (resetAll) {
      resetAll.addEventListener("click", () => {
        Reveal.slide(0);
      });
      // resetAll.click();
    }

    const clickBox = document.getElementById("clickbox");
    const menuButton = document.getElementById("URMenu");
    const menuOptions = document.getElementById("menuOptions");
    const toggleTheme = document.getElementById("toggleTheme");
    if (clickBox !== null && menuButton !== null && menuOptions !== null && toggleTheme !== null) {

      const lightTheme = "white";
      const darkTheme = "black";

      let theme = lightTheme;

      checkToggles("theme", false);
      function checkToggles(type, doToggle = true) {
        if (type === "theme") {
          if (doToggle) theme = theme === lightTheme ? darkTheme : lightTheme;
          toggleTheme.textContent = theme === lightTheme ? "🌙" : "☀️";
          // document.body.dataset.theme = theme;
          theTheme = document.getElementById("theme");
          theTheme.setAttribute("href", `styles/${theme}.css`);
        }
      }

      toggleTheme.addEventListener("click", () => {
        checkToggles("theme");
      });
    }

    const sectionHeaders = document.getElementById("sectionHeaders");
    const contentsList = document.getElementById("contentsList");
    document.querySelectorAll("section").forEach((element, index) => {
      if (element.querySelector("h1") === null) {
        return;
      } else {
        e = document.createElement("span");
        e.textContent = element.querySelector("h1").textContent;
        if (e.textContent == document.getElementById("title").textContent) {
          return;
        }
        e.classList.add("clickable");
        e.style.cursor = "pointer";
        e.addEventListener("click", () => {
          Reveal.slide(index);
        });

        ce = document.createElement("li");
        ce.textContent = e.textContent;
        ce.style.cursor = "pointer";
        ce.style.margin = "1em 0 0 0";
        ce.setAttribute("data-target", index);
        ce.addEventListener("click", () => {
          Reveal.slide(index);
        });
        contentsList.appendChild(ce);

        sectionHeaders.appendChild(e);
        e = document.createElement("span");
        e.textContent = " • ";
        sectionHeaders.appendChild(e);
      }
    });
    sectionHeaders.removeChild(sectionHeaders.lastChild);

    function syncHeaderHighlight() {
      sectionHeaders.querySelectorAll("span").forEach((element) => {
        element.classList.remove("present");
      });
      /* agora adicionar o estado "present" ao span que coincida à section atual ou anterior (caso a atual nao tenha h1)*/
      let currentSlide = Reveal.getCurrentSlide();
      let lastH1Text = null;

      // Sobe para o pai se for um slide vertical, ou começa do atual
      let checkSlide = currentSlide;

      // Percorre o DOM para trás a partir do slide atual para achar o H1 mais próximo
      while (checkSlide) {
        let h1 = checkSlide.querySelector("h1");
        if (
          h1 &&
          h1.textContent !== document.getElementById("title").textContent
        ) {
          lastH1Text = h1.textContent;
          break;
        }

        // Tenta o slide anterior no mesmo nível ou sobe para o pai (no caso de slides verticais)
        if (checkSlide.previousElementSibling) {
          checkSlide = checkSlide.previousElementSibling;
          // Se o anterior tiver filhos (vertical), pula para o último filho dele para manter a ordem cronológica
          if (
            checkSlide.children.length > 0 &&
            checkSlide.tagName === "SECTION"
          ) {
            const subSections = checkSlide.querySelectorAll("section");
            if (subSections.length > 0)
              checkSlide = subSections[subSections.length - 1];
          }
        } else {
          checkSlide =
            checkSlide.parentElement &&
              checkSlide.parentElement.tagName === "SECTION"
              ? checkSlide.parentElement
              : null;
        }
      }

      // Aplica a classe "present" no span correspondente
      if (lastH1Text) {
        sectionHeaders.querySelectorAll("span").forEach((span) => {
          if (span.textContent === lastH1Text) {
            span.classList.add("present");
          }
        });
      }
    }

    Reveal.addEventListener("slidechanged", syncHeaderHighlight);

    if (window.location.search.match(/print-pdf/gi)) {
      const observer = new MutationObserver(function (mutations) {
        if (document.querySelector(".pdf-page")) {
          const divFooter = document.getElementById("nonpdf-footer");
          divFooter.style.visibility = "hidden";
          const divSectionHeaders = document.getElementById("sectionHeaders");
          divSectionHeaders.style.visibility = "hidden";
          document.querySelectorAll(".pdf-page").forEach((element, index) => {
            const F = document.createElement("div");
            F.classList.add("reveal-footer", "reveal-footer-pdf");
            F.innerHTML = `
                  <span>V. D. de Souza</span>
                  <span>•</span>
                  <span>Alternative BBA techniques for SIRIUS</span>
                  <span>•</span>
                  <span>May 15, 2026</span>
                `;
            element.appendChild(F);
            const G = document.createElement("div");
            G.classList.add("reveal-chapters-pdf");
            G.innerHTML = divSectionHeaders.innerHTML;
            G.dataset.target = index;
            element.appendChild(G);
          });

          const headerIndices = Array.from(
            document.querySelectorAll("#contentsList li"),
            (e) => [e.textContent, e.dataset.target],
          );
          // console.log(headerIndices);
          let toHighlight = "";
          document
            .querySelectorAll(".reveal-chapters-pdf")
            .forEach((element) => {
              // limpa classe present de todos os spans dos headers
              const nowI = headerIndices.map(
                (i) => i[1] - element.dataset.target,
              );
              // console.log("page =", element.dataset.target, "nowI =", nowI);
              const ioZero = nowI.indexOf(0);
              if (ioZero != -1) {
                toHighlight = headerIndices[ioZero][0];
              }
              // console.log(toHighlight);
              element.querySelectorAll("span").forEach((span, k) => {
                span.classList.remove("present");
                span.classList.remove("clickable");
                span.style.cursor = "default";
                if (span.textContent == toHighlight) {
                  span.classList.add("present");
                }
              });
            });

          observer.disconnect(); // Para de observar após adicionar
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }