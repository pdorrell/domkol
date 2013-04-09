;; Project values

(load-this-project
 `( (:ruby-executable ,*ruby-1.9-executable*)
    (:search-extensions (".js" ".html"))
    (:compile-command ,"rake")
    (:build-function project-compile-with-command)
    ) )
