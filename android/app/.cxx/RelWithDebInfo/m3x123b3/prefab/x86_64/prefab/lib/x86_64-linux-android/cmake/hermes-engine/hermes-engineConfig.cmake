if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "C:/Users/himan/.gradle/caches/9.4.1/transforms/38fd7a19c805dad40fb95f89b41aac77/transformed/hermes-android-250829098.0.17-release/prefab/modules/hermesvm/libs/android.x86_64/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/himan/.gradle/caches/9.4.1/transforms/38fd7a19c805dad40fb95f89b41aac77/transformed/hermes-android-250829098.0.17-release/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

