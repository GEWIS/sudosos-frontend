<template>
  <div id="app">
    <nav class="navbar navbar-gewis navbar-static-top rainbow" role="navigation">
      <div class="container">
        <div class="navbar-header navbar-left pull-left">
          <a href="/" class="navbar-brand">
            <img src="/img/gewis-branding.svg" alt="GEWIS Logo" />
          </a>
        </div>
        <div class="navbar-header navbar-right pull-right">
          <ul class="nav navbar-nav pull-left no-collapse">
            <li class="dropdown pull-right">
              <a
                href="#"
                class="dropdown-toggle"
                data-toggle="dropdown"
                role="button"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <i class="fas fa-globe-europe"></i>
                <span class="sr-only">Taalinstellingen</span>
                <span class="caret"></span>
              </a>
              <ul class="dropdown-menu language">
                <li>
                  <a class href="/lang/en/">
                    <span
                      class="flag-icon flag-icon-en"
                      style="background-image: url('/img/en.svg');"
                    ></span>English
                  </a>
                </li>
                <li>
                  <a class="disabled" href="/lang/nl/">
                    <span
                      class="flag-icon flag-icon-nl"
                      style="background-image: url('/img/nl.svg');"
                    ></span>Nederlands
                  </a>
                </li>
              </ul>
            </li>
            <li class="dropdown pull-right">
              <a
                href="#"
                class="dropdown-toggle"
                data-toggle="dropdown"
                role="button"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Rick
                <span class="caret"></span>
              </a>
              <ul class="dropdown-menu">
                <li>
                  <a href="/member/self">Mijn informatie</a>
                </li>
                <li>
                  <a href="https://gewis.nl/susos/account/websitelogin.php">SuSOS</a>
                </li>
                <li>
                  <a href="/user/password">Wijzig wachtwoord</a>
                </li>
                <li>
                  <a href="/admin/">Admin</a>
                </li>
                <li>
                  <a href="/user/logout">Uitloggen</a>
                </li>
              </ul>
            </li>
          </ul>
          <button
            type="button"
            class="navbar-toggle"
            data-toggle="collapse"
            data-target=".navbar-collapse"
          >
            <span class="sr-only">Klap navigatie in/uit</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
        </div>
        <div class="visible-xs-block clearfix"></div>
        <div class="collapse navbar-collapse">
          <ul class="nav navbar-nav navbar-left">
            <li class="dropdown dropdown-hover">
              <a
                href="/vereniging/"
                role="button"
                class="dropdown-toggle visible-sm visible-xs"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Vereniging
                <span class="caret"></span>
              </a>
              <a href="/vereniging/" role="button" class="hidden-sm hidden-xs">Vereniging</a>
              <ul class="dropdown-menu">
                <li class="visible-sm visible-xs">
                  <a href="/vereniging/">Vereniging</a>
                </li>
                <li>
                  <a href="/vereniging/av/">Algemene Vergadering</a>
                </li>
                <li>
                  <a href="/vereniging/bestuur/">Bestuur</a>
                </li>
                <li>
                  <a href="/association/committees">Commissies</a>
                </li>
                <li>
                  <a href="/association/fraternities">Disputen</a>
                </li>
                <li>
                  <a href="/vereniging/lied/">GEWIS-lied</a>
                </li>
                <li>
                  <a href="/vereniging/statuten/">Reguleringen</a>
                </li>
                <li>
                  <a href="/vereniging/contact/">Contact</a>
                </li>
                <li>
                  <a href="/links/">Links</a>
                </li>
              </ul>
            </li>
            <li class="dropdown dropdown-hover">
              <a
                href="/career"
                role="button"
                aria-haspopup="true"
                aria-expanded="false"
                class="dropdown-toggle visible-sm visible-xs"
                data-toggle="dropdown"
              >
                Bedrijven
                <span class="caret"></span>
              </a>
              <a href="/career" role="button" class="hidden-sm hidden-xs">Bedrijven</a>
              <ul class="dropdown-menu">
                <li class="visible-sm visible-xs">
                  <a href="/career">Bedrijven</a>
                </li>
                <li></li>
                <li>
                  <a href="/career/vacatures">Vacatures</a>
                </li>

                <li></li>
                <li>
                  <a href="/career/stages">Stages</a>
                </li>

                <li></li>
                <li>
                  <a href="/career/traineeships">Traineeships</a>
                </li>

                <li></li>
                <li>
                  <a href="/career/werkstudent-vacatures">Werkstudent vacatures</a>
                </li>

                <li></li>
                <li>
                  <a href="/career/afstudeerstages">Afstudeerstages</a>
                </li>
              </ul>
            </li>
            <li class>
              <a href="/education">Onderwijs</a>
            </li>
            <li class="dropdown dropdown-hover">
              <a
                href="/activity"
                role="button"
                aria-haspopup="true"
                aria-expanded="false"
                class="dropdown-toggle visible-sm visible-xs"
                data-toggle="dropdown"
              >
                Activiteiten
                <span class="caret"></span>
              </a>
              <a href="/activity" role="button" class="hidden-sm hidden-xs">Activiteiten</a>
              <ul class="dropdown-menu">
                <li class="visible-sm visible-xs">
                  <a href="/activity">Activiteiten</a>
                </li>
                <li>
                  <a href="/activity/my">Mijn activiteiten</a>
                </li>
                <li>
                  <a href="/activity/archive">Archief</a>
                </li>
                <li>
                  <a href="/activity/create">Maak een activiteit</a>
                </li>
                <li>
                  <a href="/activity/calendar/">
                    Optie
                    Kalender
                  </a>
                </li>
                <li>
                  <a href="/activity/career">Carrière gerelateerd</a>
                </li>
              </ul>
            </li>
            <li class="dropdown dropdown-hover">
              <a
                href="/photo"
                role="button"
                aria-haspopup="true"
                aria-expanded="false"
                class="dropdown-toggle visible-sm visible-xs"
                data-toggle="dropdown"
              >
                Foto's
                <span class="caret"></span>
              </a>
              <a href="/photo" role="button" class="hidden-sm hidden-xs">Foto's</a>
              <ul class="dropdown-menu">
                <li class="visible-sm visible-xs">
                  <a href="/photo">Foto's</a>
                </li>
                <li>
                  <a href="/photo/weekly">Foto van de week</a>
                </li>
                <li>
                  <a href="/photo/member/7987">Mijn foto’s</a>
                </li>
              </ul>
            </li>
          </ul>
          <ul class="nav navbar-nav navbar-right">
            <li class>
              <a href="/member">Leden</a>
            </li>
          </ul>
        </div>
        <!--/.nav-collapse -->
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss">
</style>
