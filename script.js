const form = document.querySelector(".contact-form");
const statusMessage = document.querySelector(".form-status");
const header = document.querySelector(".site-header");
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const messages = {
  name: "Informe seu nome.",
  email: "Informe um e-mail válido.",
  phone: "Informe seu telefone.",
  message: "Escreva uma mensagem.",
};

function setFieldState(field, message) {
  const wrapper = field.closest(".field");
  const currentMessage = wrapper.querySelector(".field-message");

  wrapper.classList.toggle("field-error", Boolean(message));
  field.setAttribute("aria-invalid", message ? "true" : "false");

  if (currentMessage) {
    currentMessage.remove();
  }

  if (message) {
    const error = document.createElement("span");
    error.className = "field-message";
    error.textContent = message;
    error.id = `${field.id}-error`;
    field.setAttribute("aria-describedby", error.id);
    wrapper.append(error);
  } else {
    field.removeAttribute("aria-describedby");
  }
}

function validateField(field) {
  const value = field.value.trim();
  const isEmail = field.type === "email";
  const validEmail = !isEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const message = value && validEmail ? "" : messages[field.name];

  setFieldState(field, message);
  return !message;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const fields = Array.from(form.querySelectorAll("input, textarea"));
  const validations = fields.map(validateField);
  const isValid = validations.every(Boolean);

  if (!isValid) {
    statusMessage.textContent = "";
    fields.find((field) => field.getAttribute("aria-invalid") === "true")?.focus();
    return;
  }

  form.reset();
  fields.forEach((field) => setFieldState(field, ""));
  statusMessage.textContent = "Mensagem enviada com sucesso. Em breve entraremos em contato.";
});

form.querySelectorAll("input, textarea").forEach((field) => {
  field.addEventListener("blur", () => validateField(field));
  field.addEventListener("input", () => {
    if (field.getAttribute("aria-invalid") === "true") {
      validateField(field);
    }
    statusMessage.textContent = "";
  });
});

function updateHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
}

function setupSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      const target = targetId && document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({
        behavior: motionQuery.matches ? "auto" : "smooth",
        block: "start",
      });
    });
  });
}

function setupRevealAnimations() {
  const revealElements = Array.from(
    document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale"),
  );

  document.querySelectorAll(".steps, .cards-grid").forEach((group) => {
    Array.from(group.children).forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${Math.min(index * 95, 380)}ms`);
    });
  });

  if (motionQuery.matches || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.14,
    },
  );

  revealElements.forEach((element) => observer.observe(element));
}

function setupParallax() {
  const parallaxElements = Array.from(document.querySelectorAll("[data-parallax]"));
  let ticking = false;

  function applyParallax() {
    ticking = false;

    if (motionQuery.matches || window.innerWidth < 700) {
      parallaxElements.forEach((element) => element.style.setProperty("--parallax-y", "0px"));
      return;
    }

    const viewportHeight = window.innerHeight || 1;

    parallaxElements.forEach((element) => {
      const strength = Number(element.dataset.parallax || 0);
      const rect = element.getBoundingClientRect();
      const progress = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
      const offset = Math.max(-18, Math.min(18, progress * strength * -120));

      element.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
    });
  }

  function requestParallax() {
    if (ticking) {
      return;
    }

    ticking = true;
    requestAnimationFrame(applyParallax);
  }

  window.addEventListener("scroll", requestParallax, { passive: true });
  window.addEventListener("resize", requestParallax);
  motionQuery.addEventListener?.("change", requestParallax);
  requestParallax();
}

window.addEventListener("scroll", updateHeaderState, { passive: true });
updateHeaderState();
setupSmoothAnchors();
setupRevealAnimations();
setupParallax();
