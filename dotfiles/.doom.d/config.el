;;; $DOOMDIR/config.el -*- lexical-binding: t; -*-

;; Place your private configuration here! Remember, you do not need to run 'doom
;; sync' after modifying this file!


;; Some functionality uses this to identify you, e.g. GPG configuration, email
;; clients, file templates and snippets.
(setq user-full-name "Logan Weber"
      user-mail-address "loganrweber@gmail.com")

;; Doom exposes five (optional) variables for controlling fonts in Doom. Here
;; are the three important ones:
;;
;; + `doom-font'
;; + `doom-variable-pitch-font'
;; + `doom-big-font' -- used for `doom-big-font-mode'; use this for
;;   presentations or streaming.
;;
;; They all accept either a font-spec, font string ("Input Mono-12"), or xlfd
;; font string. You generally only need these two:
(setq doom-font (font-spec :family "monospace" :size 14))

;; There are two ways to load a theme. Both assume the theme is installed and
;; available. You can either set `doom-theme' or manually load a theme with the
;; `load-theme' function. This is the default:
(setq doom-theme 'doom-one)

;; If you use `org' and don't want your org files in the default location below,
;; change `org-directory'. It must be set before org loads!
(setq org-directory "~/Dropbox/Personal Wikis/Emacs Org")

;; This determines the style of line numbers in effect. If set to `nil', line
;; numbers are disabled. For relative line numbers, set this to `relative'.
(setq display-line-numbers-type t)


;; Here are some additional functions/macros that could help you configure Doom:
;;
;; - `load!' for loading external *.el files relative to this one
;; - `use-package' for configuring packages
;; - `after!' for running code after a package has loaded
;; - `add-load-path!' for adding directories to the `load-path', relative to
;;   this file. Emacs searches the `load-path' when you load packages with
;;   `require' or `use-package'.
;; - `map!' for binding new keys
;;
;; To get information about any of these functions/macros, move the cursor over
;; the highlighted symbol at press 'K' (non-evil users must press 'C-c g k').
;; This will open documentation for it, including demos of how they are used.
;;
;; You can also try 'gd' (or 'C-c g d') to jump to their definition and see how
;; they are implemented.

(setq-default tab-width 4)
(setq-default c-basic-indent 4)
(setq-default c-basic-offset 4)
(setq-default indent-tabs-mode nil)

(defun doobs-c-sharp-config ()
  (setq-default tab-width 2)
  (setq-default c-basic-indent 2)
  (setq-default c-basic-offset 2))
(add-hook 'csharp-mode-hook 'doobs-c-sharp-config t)

;; (add-to-list 'load-path "/Users/doobs/.opam/4.10.0+afl/share/emacs/site-lisp")
;; (require 'ocp-indent)

;; (use-package! org-gcal)
;; (setq org-gcal-client-id "2323023194-7ose5caljk9m7hngjisj6448j48mlrqj.apps.googleusercontent.com"
;;       org-gcal-client-secret "your-secretbe3P8_u3fSBiy3HLYrO2lVbV"
;;       org-gcal-file-alist '(("loganrweber@gmail.com" .  (concat org-directory "/gcal.org"))
;;                             ))

(setq org-roam-directory (concat org-directory "/org-roam"))

(use-package! org-roam
  :commands (org-roam-insert org-roam-find-file org-roam)
  :init
  (setq org-roam-graph-viewer "/usr/bin/open")
  (map! :leader
        :prefix "r"
        :desc "Org-Roam-Insert" "i" #'org-roam-insert
        :desc "Org-Roam-Find"   "/" #'org-roam-find-file
        :desc "Org-Roam-Buffer" "r" #'org-roam
        :config
        (org-roam-mode +1)))

(use-package deft
  :after org
  :bind
  ("C-c n d". deft)
  :custom
  (deft-recursive t)
  (deft-use-filter-string-for-filename t)
  (deft-default-extension "org")
  (deft-directory org-roam-directory))

(use-package org-journal
  :bind
  ("C-c n j". org-journal-new-entry)
  :custom
  (org-journal-date-prefix "#+TITLE: ")
  (org-journal-file-format "%Y-%m-%d.org")
  (org-journal-dir (concat org-roam-directory "/journal"))
  (org-journal-date-format "%A, %d %B %Y"))
