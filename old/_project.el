;; Project values

(load-this-project
 `( 
   (:project-type javascript)
   (:ruby-executable "ruby")
   (:compile-command "rake")
   (:main-html-file "main.html")
   (:run-project-command (open-file-in-web-browser (project-file :main-html-file)))
   (:build-function project-compile-with-command)
   (:sass-watch-src-output-argument "."))
   ) )

