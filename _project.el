;; Project values

(load-this-project
 `( (:ruby-executable ,*ruby-1.9-executable*)
    (:search-extensions (".js" ".html" ".css" ".scss"))
    (:compile-command ,"rake")
    (:main-html-file "main.html")
    (:run-project-command (open-file-in-web-browser (project-file :main-html-file)))
    (:build-function project-compile-with-command)
   (:sass-watch-src-output-argument ,(concat (project-base-directory)))
    ) )
