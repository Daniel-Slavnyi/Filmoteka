'use strict';
import axios from '../../node_modules/axios/index';
import * as basicLightbox from 'basiclightbox';
import createModalMurkupById from '../tamlates/modal.hbs';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { addSelectedWatched, addSelectedQueue } from './local-storage';
import { initId } from './check-include-id';
import { MovieAPI } from './movie-API';
import { ModalPagination } from './modal-pagination';
import { refs } from './refs-homepage';
import { inputTogleEl } from './theme';
import methodsStorage from './storage-theme';

const THEME_KEY = 'theme';
const movieApi = new MovieAPI();

const modalPagination = new ModalPagination();

refs.galleryEl.addEventListener('click', onGalleryClick);

function updateDataForModal(data) {
  return {
    ...data,
    popularity: data.popularity.toFixed(0),
    vote_average: data.vote_average.toFixed(1),
    genres: data.genres
      .map(({ name }) => {
        return name;
      })
      .join(', '),
  };
}

async function onGalleryClick(e) {
  const item = e.target.closest('.gallery_card');
  if (!item) {
    return;
  }

  const idMovie = item.dataset.id;
  document.body.style.overflow = 'hidden';

  try {
    const data = await movieApi.getMovieById(idMovie);
    const propertieMovie = updateDataForModal(data);
    refs.backdropEl.insertAdjacentHTML(
      'beforeend',
      createModalMurkupById(propertieMovie)
    );
// change theme
    const modalEl = document.querySelector('.modal');
    const btnPlus = document.querySelector('.btn-plus');
    const btnMinus = document.querySelector('.btn-minus');
    
    if (inputTogleEl.checked) {
     
     modalEl.classList.add('dark-theme-modal');
      refs.backdropEl.classList.add('dark-theme-modal-bg');
      btnPlus.classList.add('dark-theme-arrow');
      btnMinus.classList.add('dark-theme-arrow');
    }
  } catch (error) {
    Notify.failure(error.message);
    return;
  }

  refs.backdropEl.classList.remove('is-hidden');
  document.addEventListener('keydown', onEscDown);

  initId();

  modalPagination.setIdArr('.gallery_card');
  modalPagination.setIndxOfId(item.dataset.id);
}

refs.backdropEl.addEventListener('click', onBackdropClick);

async function onBackdropClick(e) {
  if (e.target.classList.contains('backdrop')) {
    closeModal();
  }

  if (e.target.classList.contains('btn-add-watched')) {
    addSelectedWatched();
  }

  if (e.target.classList.contains('btn-add-queue')) {
    addSelectedQueue();
  }
  if (e.target.classList.contains('btn-trailer')) {
    console.log(e.target);

    await onBtnTrailer();
    console.log(e.target);
    console.log(document.querySelector('.basicLightbox__placeholder'));
    document
      .querySelector('.basicLightbox__placeholder')
      .addEventListener('click', e => {
        console.log(e.target);
        if (e.target.classList.contains('basicLightbox__placeholder')) {
          modalTrailer.close();
        }
      });
  }

  if (e.target.closest('.modal__btn-close')) {
    closeModal();
  }

  if (e.target.closest('.btn-plus')) {
    getFetchCardById(modalPagination.getNextId());
  }

  if (e.target.closest('.btn-minus')) {
    getFetchCardById(modalPagination.getPreviousId());
  }
}
async function onBtnTrailer() {
  const imgSelected = document.querySelector('.modal__img');
  const idMovie = imgSelected.dataset.id;
  await fetchAndCreateTrailer(idMovie);
}
function closeModal() {
  refs.backdropEl.querySelector('.modal').remove();
  document.removeEventListener('keydown', onEscDown);
  refs.backdropEl.classList.add('is-hidden');
  document.body.style.overflow = '';
}

function onEscDown(e) {
  if (e.code === 'Escape') {
    modalTrailer.close();
    closeModal();
  }
}

async function getFetchCardById(id) {
  try {
    const data = await movieApi.getMovieById(id);
    const propertieMovie = updateDataForModal(data);

    refs.backdropEl.querySelector('.modal').remove();
    refs.backdropEl.insertAdjacentHTML(
      'beforeend',
      createModalMurkupById(propertieMovie)
    );
    //  change theme
    if (inputTogleEl.checked) {
      const modalEl = document.querySelector('.modal');
      modalEl.classList.add('dark-theme-modal');
      refs.backdropEl.classList.add('dark-theme-modal-bg');
    }

    initId();
  } catch (error) {
    Notify.failure(error.message);
    return;
  }
}

async function fetchAndCreateTrailer(id) {
  const responseWithVideo = await movieApi.getMovieTrailer(id);

  modalTrailer = basicLightbox.create(
    `
  <iframe class='iframe-trailer' width="560" height="315" src="https://www.youtube.com/embed/${responseWithVideo.results[0].key}" frameborder="0" allowfullscreen></iframe>
`
  );
  modalTrailer.show();
}
refs.galleryEl.addEventListener('click', onGalleryClick);

// SET THEME ===========================================

function setThemeOnModal() {
  const savedTheme = methodsStorage.load(THEME_KEY);

  
}
